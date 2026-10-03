import asyncio
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import AsyncGenerator, Dict
from app.config import settings
from app.schemas.task import TaskStatus, TaskEvent
from app.schemas.agent import ImplementationPlan, VerificationReport, ToolCallResult, CodeReviewResult
from app.models.database import SessionLocal, TaskModel, TaskEventModel, RepositoryModel, TestRunModel
from app.agents.repository_agent import repository_agent
from app.agents.planner_agent import planner_agent
from app.agents.coding_agent import coding_agent
from app.agents.execution_agent import execution_agent
from app.agents.debugging_agent import debugging_agent
from app.agents.verification_agent import verification_agent
from app.agents.review_agent import review_agent
from app.intelligence.retriever import retrieve_relevant_context
from app.tools.git_adapter import get_git_diff, create_task_branch, commit_task_changes
from app.tools.registry import tool_registry, ToolRisk

# In-memory pub/sub broker for real-time SSE task streaming
class EventBroker:
    def __init__(self):
        self._subscribers: dict[str, list[asyncio.Queue]] = {}

    def subscribe(self, task_id: str) -> asyncio.Queue:
        if task_id not in self._subscribers:
            self._subscribers[task_id] = []
        q = asyncio.Queue()
        self._subscribers[task_id].append(q)
        return q

    def unsubscribe(self, task_id: str, q: asyncio.Queue):
        if task_id in self._subscribers and q in self._subscribers[task_id]:
            self._subscribers[task_id].remove(q)

    async def publish(self, task_id: str, event: TaskEvent):
        # Save event to database
        try:
            with SessionLocal() as db:
                event_db = TaskEventModel(
                    id=event.id,
                    task_id=event.task_id,
                    agent=event.agent,
                    stage=event.stage,
                    event_type=event.event_type,
                    title=event.title,
                    detail=event.detail,
                    data_json=json.dumps(event.data)
                )
                db.add(event_db)
                db.commit()
        except Exception as e:
            print(f"[EventBroker] Error saving event to db: {e}")

        # Broadcast to active queues
        if task_id in self._subscribers:
            for q in list(self._subscribers[task_id]):
                await q.put(event)

event_broker = EventBroker()

class Orchestrator:
    def __init__(self):
        self._approval_events: Dict[str, asyncio.Event] = {}
        self._approval_decisions: Dict[str, bool] = {}
        self._cancelled_tasks: set[str] = set()

    def approve_task(self, task_id: str) -> bool:
        if task_id in self._approval_events:
            self._approval_decisions[task_id] = True
            self._approval_events[task_id].set()
            return True
        return False

    def reject_task(self, task_id: str) -> bool:
        if task_id in self._approval_events:
            self._approval_decisions[task_id] = False
            self._approval_events[task_id].set()
            return True
        return False

    def cancel_task(self, task_id: str) -> bool:
        self._cancelled_tasks.add(task_id)
        if task_id in self._approval_events:
            self._approval_decisions[task_id] = False
            self._approval_events[task_id].set()
        return True

    def is_cancelled(self, task_id: str) -> bool:
        return task_id in self._cancelled_tasks

    async def run_task(self, task_id: str, workspace_path: Path, task_prompt: str) -> None:
        """
        Coordinates the full autonomous engineering loop:
        Understand -> Plan -> Approval Gate -> Implement -> Test -> Observe -> Reason -> Fix -> Retest -> Review -> Verify -> Git Commit
        """
        db = SessionLocal()
        task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
        if not task:
            db.close()
            return
        
        branch_name = f"agent/task-{task_id[:8]}"
        create_task_branch(workspace_path, branch_name)

        try:
            # -------------------------------------------------------------
            # STAGE 1: ANALYZING (Repository Intelligence)
            # -------------------------------------------------------------
            if self.is_cancelled(task_id):
                return
            await self._emit(task_id, "analyzer", "ANALYZING", "status_change", "Analyzing repository architecture...")
            repo_analysis = repository_agent.analyze(workspace_path)
            await self._emit(
                task_id, "analyzer", "ANALYZING", "log",
                f"Architecture detected: {', '.join(repo_analysis.languages)} | Frameworks: {', '.join(repo_analysis.frameworks) or 'Standard'}",
                data={"analysis": repo_analysis.model_dump()}
            )
            
            # Context Retrieval
            retrieval = retrieve_relevant_context(workspace_path, task_prompt)
            await self._emit(
                task_id, "analyzer", "ANALYZING", "log",
                f"Retrieved {len(retrieval['matched_files'])} relevant files: {', '.join(retrieval['matched_files'][:3])}",
                data={"matched_files": retrieval["matched_files"]}
            )

            # -------------------------------------------------------------
            # STAGE 2: PLANNING
            # -------------------------------------------------------------
            if self.is_cancelled(task_id):
                return
            await self._emit(task_id, "planner", "PLANNING", "status_change", "Generating structured implementation plan...")
            plan: ImplementationPlan = await planner_agent.create_plan(
                workspace_dir=workspace_path,
                task_prompt=task_prompt,
                repo_analysis=repo_analysis,
                relevant_context=retrieval
            )
            
            task.plan_json = json.dumps(plan.model_dump())
            db.commit()

            await self._emit(
                task_id, "planner", "PLANNING", "plan_ready",
                f"Implementation plan formulated: {len(plan.implementation_steps)} steps identified",
                detail=plan.summary,
                data={"plan": plan.model_dump()}
            )

            # -------------------------------------------------------------
            # SERVER-SIDE HUMAN APPROVAL GATE
            # -------------------------------------------------------------
            requires_approval = (not task.auto_approve) or plan.requires_user_approval
            if requires_approval:
                task.status = "AWAITING_APPROVAL"
                task.current_stage = "AWAITING_APPROVAL"
                db.commit()

                await self._emit(
                    task_id, "orchestrator", "AWAITING_APPROVAL", "awaiting_approval",
                    "Task execution paused: Awaiting human engineer approval to proceed.",
                    detail="Review the formulated plan, affected files, and verification commands before authorizing modifications.",
                    data={"plan": plan.model_dump()}
                )

                # Initialize wait event
                approval_event = asyncio.Event()
                self._approval_events[task_id] = approval_event
                
                # Block until approval/rejection or cancellation
                await approval_event.wait()
                
                decision = self._approval_decisions.get(task_id, False)
                self._approval_events.pop(task_id, None)
                self._approval_decisions.pop(task_id, None)

                if not decision or self.is_cancelled(task_id):
                    task.status = "CANCELLED"
                    task.current_stage = "CANCELLED"
                    task.error_message = "Task rejected or cancelled by human operator."
                    task.completed_at = datetime.utcnow()
                    db.commit()
                    await self._emit(task_id, "orchestrator", "CANCELLED", "summary", "Task execution halted by user.")
                    return

                await self._emit(task_id, "orchestrator", "PLANNING", "log", "Plan authorized by user. Proceeding to implementation.")

            # -------------------------------------------------------------
            # STAGE 3: IMPLEMENTING (Code Agent)
            # -------------------------------------------------------------
            if self.is_cancelled(task_id):
                return
            await self._emit(task_id, "coder", "IMPLEMENTING", "status_change", "Applying surgical code modifications...")
            
            tool_registry.audit_call(
                task_id=task_id,
                agent="coder",
                tool="coding_agent.implement_plan",
                arguments={"task_prompt": task_prompt, "files": plan.files_to_modify},
                output="Synthesizing patches",
                error=None,
                exit_code=0,
                duration_ms=150,
                risk_level=ToolRisk.LOW
            )

            modified_files = await coding_agent.implement_plan(
                workspace_dir=workspace_path,
                plan=plan,
                task_prompt=task_prompt,
                repo_summary=repo_analysis.model_dump()
            )
            
            await self._emit(
                task_id, "coder", "IMPLEMENTING", "log",
                f"Modified {len(modified_files)} file(s): {', '.join(modified_files)}",
                data={"modified_files": modified_files}
            )

            # -------------------------------------------------------------
            # STAGE 4: TESTING & VALIDATION (Execution Agent)
            # -------------------------------------------------------------
            if self.is_cancelled(task_id):
                return
            await self._emit(task_id, "executor", "TESTING", "status_change", "Executing automated test suite in sandbox...")
            
            test_cmd = plan.verification_commands[0] if plan.verification_commands else "pytest -v"
            test_result: ToolCallResult = execution_agent.run_tests(workspace_path, test_cmd)

            # Record in test_runs table
            try:
                test_run_record = TestRunModel(
                    id=str(uuid.uuid4()),
                    task_id=task_id,
                    command=test_cmd,
                    exit_code=test_result.exit_code or 0,
                    passed=test_result.success,
                    stdout=test_result.output,
                    stderr=test_result.error,
                    duration_ms=test_result.duration_ms
                )
                db.add(test_run_record)
                db.commit()
            except Exception as e:
                print(f"[Orchestrator] Failed saving test run record: {e}")
            
            await self._emit(
                task_id, "executor", "TESTING", "test_result",
                f"Executed '{test_cmd}' (Exit code: {test_result.exit_code})",
                detail=(test_result.output or test_result.error or "")[:600],
                data={
                    "success": test_result.success,
                    "exit_code": test_result.exit_code,
                    "stdout": test_result.output,
                    "stderr": test_result.error
                }
            )

            # -------------------------------------------------------------
            # STAGE 5: DEBUGGING LOOP (Observe -> Reason -> Fix -> Retest)
            # -------------------------------------------------------------
            retry_count = 0
            while not test_result.success and retry_count < settings.MAX_DEBUG_ATTEMPTS:
                if self.is_cancelled(task_id):
                    return
                retry_count += 1
                task.retry_count = retry_count
                db.commit()

                await self._emit(
                    task_id, "debugger", "DEBUGGING", "status_change",
                    f"Debugging loop triggered (Attempt {retry_count}/{settings.MAX_DEBUG_ATTEMPTS})..."
                )

                fix_plan = await debugging_agent.analyze_and_repair(
                    workspace_dir=workspace_path,
                    task_prompt=task_prompt,
                    test_result=test_result,
                    attempt=retry_count,
                    modified_files=modified_files
                )

                await self._emit(
                    task_id, "debugger", "DEBUGGING", "log",
                    f"Classified failure: {fix_plan.classification.category}. Root cause: {fix_plan.classification.root_cause}",
                    detail=fix_plan.fix_description,
                    data={"fix_plan": fix_plan.model_dump()}
                )

                # Re-test after applying repair
                await self._emit(task_id, "executor", "TESTING", "log", f"Re-running verification test suite (Attempt {retry_count})...")
                test_result = execution_agent.run_tests(workspace_path, test_cmd)
                
                await self._emit(
                    task_id, "executor", "TESTING", "test_result",
                    f"Re-test result: {'PASSED' if test_result.success else 'FAILED'} (Exit code: {test_result.exit_code})",
                    detail=(test_result.output or test_result.error or "")[:600],
                    data={"success": test_result.success, "exit_code": test_result.exit_code}
                )

            # -------------------------------------------------------------
            # STAGE 6: CODE REVIEW & SECURITY INSPECTION
            # -------------------------------------------------------------
            if self.is_cancelled(task_id):
                return
            await self._emit(task_id, "reviewer", "VERIFYING", "log", "Conducting automated code and security review...")
            review_res: CodeReviewResult = await review_agent.review(workspace_path, task_prompt)
            await self._emit(
                task_id, "reviewer", "VERIFYING", "log",
                f"Review verdict: {'APPROVED' if review_res.approved else 'CHANGES_REQUESTED'}. {review_res.summary}",
                data={"review": review_res.model_dump()}
            )

            # -------------------------------------------------------------
            # STAGE 7: VERIFICATION & GIT COMMIT (Verification Agent)
            # -------------------------------------------------------------
            await self._emit(task_id, "verifier", "VERIFYING", "status_change", "Generating final verification report and Git diff...")
            diff = get_git_diff(workspace_path)
            
            # Commit changes to branch on success
            commit_sha = ""
            if test_result.success and diff.strip():
                committed, sha = commit_task_changes(workspace_path, f"feat: {task_prompt}")
                if committed:
                    commit_sha = sha
                    await self._emit(task_id, "git", "VERIFYING", "log", f"Committed verified changes to branch '{branch_name}' ({sha})")

            verification: VerificationReport = verification_agent.verify(
                workspace_dir=workspace_path,
                task_prompt=task_prompt,
                tests_passed=test_result.success,
                modified_files=modified_files,
                commands_run=[test_cmd]
            )

            task.verification_json = json.dumps(verification.model_dump())
            task.git_diff = diff
            task.status = "COMPLETED" if test_result.success else "FAILED"
            task.current_stage = task.status
            task.completed_at = datetime.utcnow()
            db.commit()

            await self._emit(
                task_id, "verifier", task.status, "summary",
                f"Engineering workflow finished with status: {task.status}",
                detail=verification.summary,
                data={
                    "verification": verification.model_dump(),
                    "diff": diff,
                    "branch": branch_name,
                    "commit_sha": commit_sha
                }
            )

        except Exception as e:
            task.status = "FAILED"
            task.error_message = str(e)
            task.completed_at = datetime.utcnow()
            db.commit()
            await self._emit(task_id, "orchestrator", "FAILED", "error", f"Task execution failed: {e}")
        finally:
            self._approval_events.pop(task_id, None)
            self._approval_decisions.pop(task_id, None)
            self._cancelled_tasks.discard(task_id)
            db.close()

    async def _emit(
        self,
        task_id: str,
        agent: str,
        stage: TaskStatus,
        event_type: str,
        title: str,
        detail: str | None = None,
        data: dict | None = None
    ) -> None:
        event = TaskEvent(
            id=str(uuid.uuid4()),
            task_id=task_id,
            agent=agent,
            stage=stage,
            event_type=event_type,
            title=title,
            detail=detail,
            data=data or {}
        )
        await event_broker.publish(task_id, event)

orchestrator = Orchestrator()
