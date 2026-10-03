from pathlib import Path
from app.schemas.agent import DebuggingFixPlan, ToolCallResult
from app.services.llm_provider import llm_provider
from app.tools.filesystem import read_file
from app.tools.patch_engine import PatchApplier, PatchRollback

class DebuggingAgent:
    """
    Autonomous debugging engineer. Receives failing test execution results,
    stack traces, and exit codes, classifies the failure, and applies targeted
    surgical repairs to the affected workspace files.
    """
    async def analyze_and_repair(
        self,
        workspace_dir: Path,
        task_prompt: str,
        test_result: ToolCallResult,
        attempt: int,
        modified_files: list[str]
    ) -> DebuggingFixPlan:
        # Collect current content of modified files
        file_contents = {}
        rollback = PatchRollback(workspace_dir)
        for f in modified_files:
            try:
                rollback.capture(f)
                file_contents[f] = read_file(workspace_dir, f)
            except Exception as e:
                print(f"[DebuggingAgent] Error reading {f}: {e}")

        # Call real LLM failure classifier and repair generator
        fix_plan: DebuggingFixPlan = await llm_provider.classify_and_fix_failure(
            task_prompt=task_prompt,
            failing_cmd=" ".join(test_result.tool) if isinstance(test_result.tool, list) else str(test_result.tool),
            stdout=test_result.output or "",
            stderr=test_result.error or "",
            exit_code=test_result.exit_code or 1,
            attempt=attempt,
            modified_files=modified_files,
            file_contents=file_contents
        )

        # Apply generated surgical patches
        for patch in fix_plan.patches:
            try:
                if patch.patch_type == "replace" and patch.full_content is not None:
                    PatchApplier.apply_replacement(
                        workspace_dir=workspace_dir,
                        relative_path=patch.file_path,
                        new_content=patch.full_content,
                        validate_syntax=True
                    )
                elif patch.patch_type == "hunk" and patch.old_hunk and patch.new_hunk:
                    PatchApplier.apply_hunk(
                        workspace_dir=workspace_dir,
                        relative_path=patch.file_path,
                        old_hunk=patch.old_hunk,
                        new_hunk=patch.new_hunk,
                        validate_syntax=True
                    )
            except Exception as e:
                print(f"[DebuggingAgent] Failed to apply repair patch to {patch.file_path}: {e}")
                rollback.rollback_all()
                raise e

        return fix_plan

debugging_agent = DebuggingAgent()
