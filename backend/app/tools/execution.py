import os
import shlex
import subprocess
import time
from pathlib import Path
from app.config import settings
from app.schemas.agent import ToolCallResult

BLOCKED_COMMAND_SUBSTRINGS = [
    "rm -rf /",
    "mkfs",
    ":(){ :|:& };:",
    "> /dev/sda",
    "chmod -R 777 /",
    "shutdown",
    "reboot"
]

def sanitize_command(command: str | list[str]) -> list[str]:
    if isinstance(command, str):
        raw_cmd = command.strip()
        for blocked in BLOCKED_COMMAND_SUBSTRINGS:
            if blocked in raw_cmd:
                raise ValueError(f"Security restriction: Command contains forbidden pattern '{blocked}'")
        return shlex.split(raw_cmd)
    else:
        for arg in command:
            for blocked in BLOCKED_COMMAND_SUBSTRINGS:
                if blocked in str(arg):
                    raise ValueError(f"Security restriction: Command argument contains forbidden pattern '{blocked}'")
        return [str(arg) for arg in command]

def execute_command(
    workspace_dir: Path,
    command: str | list[str],
    timeout_seconds: int = settings.COMMAND_TIMEOUT_SECONDS,
    extra_env: dict[str, str] | None = None
) -> ToolCallResult:
    start_time = time.time()
    try:
        cmd_args = sanitize_command(command)
        if not cmd_args:
            return ToolCallResult(
                tool="execute_command",
                success=False,
                error="Empty command provided.",
                exit_code=1,
                duration_ms=0
            )

        import sys
        venv_bin = str(Path(sys.executable).parent)
        env = os.environ.copy()
        env["PATH"] = f"{venv_bin}:{env.get('PATH', '')}"
        env["PYTHONPATH"] = f"{workspace_dir.resolve()}:{env.get('PYTHONPATH', '')}"
        if extra_env:
            env.update(extra_env)

        if cmd_args and cmd_args[0] == "pytest":
            cmd_args = [sys.executable, "-m", "pytest"] + cmd_args[1:]
        elif cmd_args and cmd_args[0] in ["python", "python3"]:
            cmd_args = [sys.executable] + cmd_args[1:]

        process = subprocess.run(
            cmd_args,
            cwd=str(workspace_dir.resolve()),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout_seconds,
            env=env
        )
        duration = int((time.time() - start_time) * 1000)
        
        return ToolCallResult(
            tool="execute_command",
            success=(process.returncode == 0),
            output=process.stdout,
            error=process.stderr if process.returncode != 0 else None,
            exit_code=process.returncode,
            duration_ms=duration
        )
    except subprocess.TimeoutExpired:
        duration = int((time.time() - start_time) * 1000)
        return ToolCallResult(
            tool="execute_command",
            success=False,
            error=f"Command execution timed out after {timeout_seconds} seconds.",
            exit_code=124,
            duration_ms=duration
        )
    except Exception as e:
        duration = int((time.time() - start_time) * 1000)
        return ToolCallResult(
            tool="execute_command",
            success=False,
            error=str(e),
            exit_code=1,
            duration_ms=duration
        )
