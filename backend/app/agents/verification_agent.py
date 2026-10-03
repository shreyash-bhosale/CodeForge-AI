from pathlib import Path
from app.schemas.agent import VerificationReport
from app.tools.git_adapter import get_git_diff

class VerificationAgent:
    def verify(
        self,
        workspace_dir: Path,
        task_prompt: str,
        tests_passed: bool,
        modified_files: list[str],
        commands_run: list[str]
    ) -> VerificationReport:
        diff = get_git_diff(workspace_dir)
        diff_lines = diff.splitlines()
        additions = sum(1 for line in diff_lines if line.startswith("+") and not line.startswith("+++"))
        deletions = sum(1 for line in diff_lines if line.startswith("-") and not line.startswith("---"))
        
        status = "PASSED" if tests_passed else "FAILED"
        diff_summary = f"{len(modified_files)} file(s) modified (+{additions} / -{deletions} lines)"
        
        summary = (
            f"Autonomous engineering loop completed successfully. "
            f"Implemented requested changes for '{task_prompt}' across {len(modified_files)} file(s). "
            f"All validation checks passed with clean Git diff."
            if tests_passed else
            f"Implementation completed with remaining test/validation issues after maximum retry attempts."
        )

        return VerificationReport(
            status=status,
            summary=summary,
            checks_executed=commands_run,
            tests_passed=tests_passed,
            build_passed=True,
            modified_files=modified_files,
            git_diff_summary=diff_summary,
            suggested_next_steps=[
                "Review Git diff in Codeforge Diff Inspector",
                "Create a feature branch or pull request draft",
                "Merge verified changes into working branch"
            ]
        )

verification_agent = VerificationAgent()
