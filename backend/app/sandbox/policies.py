from pathlib import Path
from app.config import settings

class SandboxPolicy:
    MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
    ALLOWED_COMMAND_PREFIXES = [
        "python", "python3", "pytest", "ruff", "mypy", "black", "flake8",
        "npm", "npx", "node", "yarn", "pnpm", "cargo", "go",
        "git", "echo", "cat", "ls", "find"
    ]
    
    @classmethod
    def is_command_allowed(cls, cmd_list: list[str]) -> tuple[bool, str]:
        if not cmd_list:
            return False, "Command is empty."
        base_cmd = Path(cmd_list[0]).name.lower()
        if base_cmd not in cls.ALLOWED_COMMAND_PREFIXES:
            return False, f"Command '{base_cmd}' is not in the sandbox allowed execution policy."
        return True, "Allowed"

    @classmethod
    def is_safe_path(cls, workspace_root: Path, target_path: Path) -> bool:
        try:
            target_path.resolve().relative_to(workspace_root.resolve())
            return True
        except ValueError:
            return False
