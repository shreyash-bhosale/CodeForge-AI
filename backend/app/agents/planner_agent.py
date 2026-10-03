from pathlib import Path
from app.schemas.agent import ImplementationPlan
from app.schemas.repository import RepositoryAnalysis
from app.services.llm_provider import llm_provider

class PlannerAgent:
    async def create_plan(
        self,
        workspace_dir: Path,
        task_prompt: str,
        repo_analysis: RepositoryAnalysis,
        relevant_context: dict
    ) -> ImplementationPlan:
        return await llm_provider.generate_plan(
            task_prompt=task_prompt,
            repo_summary=repo_analysis.model_dump(),
            relevant_context=relevant_context
        )

planner_agent = PlannerAgent()
