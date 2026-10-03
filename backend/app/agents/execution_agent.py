from pathlib import Path
from app.schemas.agent import ToolCallResult
from app.tools.execution import execute_command

class ExecutionAgent:
    def run_tests(self, workspace_dir: Path, command: str = "pytest -v") -> ToolCallResult:
        """
        Executes test runner in workspace sandbox.
        """
        cmd_args = command.split()
        return execute_command(workspace_dir, cmd_args)

    def run_build(self, workspace_dir: Path, command: str = "npm run build") -> ToolCallResult:
        """
        Executes build script in workspace sandbox.
        """
        cmd_args = command.split()
        return execute_command(workspace_dir, cmd_args)

execution_agent = ExecutionAgent()
