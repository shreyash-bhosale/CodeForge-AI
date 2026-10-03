import asyncio
from pathlib import Path
from app.agents.planner_agent import planner_agent
from app.agents.coding_agent import coding_agent
from app.agents.debugging_agent import debugging_agent
from app.agents.review_agent import review_agent
from app.agents.repository_agent import repository_agent
from app.schemas.agent import ImplementationPlan

def test_planner_agent_creates_plan(tmp_path: Path):
    async def _run():
        ws = tmp_path / "plan_ws"
        ws.mkdir()
        (ws / "main.py").write_text("from fastapi import FastAPI\napp = FastAPI()\n")
        
        analysis = repository_agent.analyze(ws)
        plan = await planner_agent.create_plan(
            workspace_dir=ws,
            task_prompt="Add a /health endpoint returning application status",
            repo_analysis=analysis,
            relevant_context={"matched_files": ["main.py"]}
        )
        assert plan is not None
        assert len(plan.implementation_steps) > 0
        assert "main.py" in plan.files_to_modify

    asyncio.run(_run())

def test_coding_agent_modifies_code(tmp_path: Path):
    async def _run():
        ws = tmp_path / "code_ws"
        ws.mkdir()
        main_file = ws / "main.py"
        main_file.write_text("from fastapi import FastAPI\napp = FastAPI()\n")

        plan = ImplementationPlan(
            objective="Add health check",
            summary="Implement /health",
            files_to_inspect=["main.py"],
            files_to_modify=["main.py"],
            files_to_create=[],
            dependencies=[],
            implementation_steps=["Add endpoint"],
            verification_commands=["pytest -v"],
            risks=[],
            requires_user_approval=False
        )

        modified = await coding_agent.implement_plan(
            workspace_dir=ws,
            plan=plan,
            task_prompt="Add a /health endpoint returning application status"
        )
        assert "main.py" in modified
        updated_code = main_file.read_text()
        assert "/health" in updated_code or "health_check" in updated_code

    asyncio.run(_run())

def test_review_agent(tmp_path: Path):
    async def _run():
        ws = tmp_path / "review_ws"
        ws.mkdir()
        (ws / "app.py").write_text("x = 10\n")
        
        res = await review_agent.review(ws, "Task test")
        assert res.approved is True

    asyncio.run(_run())
