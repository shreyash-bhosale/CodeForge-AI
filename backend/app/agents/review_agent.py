from pathlib import Path
from app.schemas.agent import CodeReviewResult
from app.services.llm_provider import llm_provider
from app.tools.git_adapter import get_git_diff

class CodeReviewAgent:
    """
    Inspects generated git diffs for correctness, security vulnerabilities,
    style violations, performance risks, and breaking changes.
    """
    async def review(self, workspace_dir: Path, task_prompt: str) -> CodeReviewResult:
        diff = get_git_diff(workspace_dir)
        if not diff.strip():
            return CodeReviewResult(
                approved=True,
                summary="No changes detected in workspace.",
                issues=[],
                warnings=[],
                suggestions=[]
            )

        return await llm_provider.review_code(git_diff=diff, task_prompt=task_prompt)

review_agent = CodeReviewAgent()
