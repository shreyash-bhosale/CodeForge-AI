from pathlib import Path
from app.schemas.agent import GeneratedTest
from app.services.llm_provider import llm_provider
from app.tools.filesystem import create_file

class TestGenerationAgent:
    """
    Synthesizes automated tests (e.g. pytest or jest) for features implemented
    by the coding agent, ensuring regression protection.
    """
    async def generate_and_save_tests(
        self,
        workspace_dir: Path,
        task_prompt: str,
        repo_summary: dict,
        target_file: str = "test_generated.py"
    ) -> GeneratedTest:
        test_obj = await llm_provider.generate_tests(
            task_prompt=task_prompt,
            repo_summary=repo_summary,
            file_context={}
        )
        
        target_path = workspace_dir / target_file
        if not target_path.exists():
            create_file(workspace_dir, target_file, test_obj.test_code)
            
        return test_obj

test_agent = TestGenerationAgent()
