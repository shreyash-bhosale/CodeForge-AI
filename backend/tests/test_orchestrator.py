import asyncio
import uuid
from pathlib import Path
from app.agents.orchestrator import orchestrator
from app.models.database import SessionLocal, TaskModel, RepositoryModel
from app.tools.git_adapter import init_git_repo

def test_orchestrator_approval_gate(tmp_path: Path):
    async def _run():
        ws = tmp_path / "orch_ws"
        ws.mkdir()
        (ws / "main.py").write_text("from fastapi import FastAPI\napp = FastAPI()\n")
        (ws / "test_app.py").write_text("def test_ok(): assert True\n")
        init_git_repo(ws)

        db = SessionLocal()
        repo_id = str(uuid.uuid4())
        repo = RepositoryModel(
            id=repo_id,
            name="Approval Test Repo",
            workspace_path=str(ws.resolve())
        )
        db.add(repo)

        task_id = str(uuid.uuid4())
        task = TaskModel(
            id=task_id,
            repository_id=repo_id,
            request="Add health check with approval required",
            status="INITIAL",
            current_stage="INITIAL",
            auto_approve=False
        )
        db.add(task)
        db.commit()
        db.close()

        # Launch task in background coroutine
        task_coro = asyncio.create_task(
            orchestrator.run_task(task_id, ws, "Add health check with approval required")
        )

        # Allow task to progress to AWAITING_APPROVAL
        await asyncio.sleep(0.5)

        db = SessionLocal()
        t = db.query(TaskModel).filter(TaskModel.id == task_id).first()
        assert t.status == "AWAITING_APPROVAL"
        db.close()

        # Approve task
        approved = orchestrator.approve_task(task_id)
        assert approved is True

        # Await completion
        await asyncio.wait_for(task_coro, timeout=10.0)

        db = SessionLocal()
        t = db.query(TaskModel).filter(TaskModel.id == task_id).first()
        assert t.status == "COMPLETED"
        db.close()

    asyncio.run(_run())

def test_orchestrator_cancellation(tmp_path: Path):
    async def _run():
        ws = tmp_path / "cancel_ws"
        ws.mkdir()
        (ws / "main.py").write_text("x = 1\n")
        init_git_repo(ws)

        db = SessionLocal()
        repo_id = str(uuid.uuid4())
        repo = RepositoryModel(
            id=repo_id,
            name="Cancel Repo",
            workspace_path=str(ws.resolve())
        )
        db.add(repo)

        task_id = str(uuid.uuid4())
        task = TaskModel(
            id=task_id,
            repository_id=repo_id,
            request="Cancel test",
            status="INITIAL",
            current_stage="INITIAL",
            auto_approve=False
        )
        db.add(task)
        db.commit()
        db.close()

        task_coro = asyncio.create_task(
            orchestrator.run_task(task_id, ws, "Cancel test")
        )
        await asyncio.sleep(0.3)

        # Cancel task
        orchestrator.cancel_task(task_id)
        await asyncio.wait_for(task_coro, timeout=5.0)

        db = SessionLocal()
        t = db.query(TaskModel).filter(TaskModel.id == task_id).first()
        assert t.status == "CANCELLED"
        db.close()

    asyncio.run(_run())
