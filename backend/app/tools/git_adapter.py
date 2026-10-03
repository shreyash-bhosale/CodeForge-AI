import subprocess
from pathlib import Path

def run_git(workspace_dir: Path, args: list[str]) -> tuple[int, str, str]:
    res = subprocess.run(
        ["git"] + args,
        cwd=str(workspace_dir.resolve()),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return res.returncode, res.stdout, res.stderr

def init_git_repo(workspace_dir: Path) -> None:
    git_dir = workspace_dir / ".git"
    if not git_dir.exists():
        gitignore = workspace_dir / ".gitignore"
        if not gitignore.exists():
            gitignore.write_text("__pycache__/\n*.py[cod]\n*$py.class\n.pytest_cache/\n.coverage\nnode_modules/\n.DS_Store\n")
        run_git(workspace_dir, ["init", "-b", "main"])
        run_git(workspace_dir, ["config", "user.name", "CodeForge AI"])
        run_git(workspace_dir, ["config", "user.email", "agent@codeforge.ai"])
        run_git(workspace_dir, ["add", "."])
        run_git(workspace_dir, ["commit", "-m", "Initial repository snapshot"])

def get_git_status(workspace_dir: Path) -> str:
    _, stdout, _ = run_git(workspace_dir, ["status", "--short"])
    return stdout.strip()

def get_git_diff(workspace_dir: Path) -> str:
    # First stage all tracked/untracked changes to get full diff against baseline or HEAD
    run_git(workspace_dir, ["add", "-N", "."])
    _, stdout, _ = run_git(workspace_dir, ["diff", "HEAD"])
    if not stdout.strip():
        # Fallback to unstaged diff
        _, stdout, _ = run_git(workspace_dir, ["diff"])
    return stdout

def create_task_branch(workspace_dir: Path, branch_name: str) -> bool:
    # Ensure current state is committed
    run_git(workspace_dir, ["add", "."])
    code, _, _ = run_git(workspace_dir, ["checkout", "-b", branch_name])
    if code != 0:
        # If branch already exists, switch to it
        run_git(workspace_dir, ["checkout", branch_name])
    return True

def commit_task_changes(workspace_dir: Path, message: str) -> tuple[bool, str]:
    run_git(workspace_dir, ["add", "."])
    code, stdout, stderr = run_git(workspace_dir, ["commit", "-m", message])
    if code == 0:
        _, sha, _ = run_git(workspace_dir, ["rev-parse", "--short", "HEAD"])
        return True, sha.strip()
    return False, stderr.strip()

def restore_git(workspace_dir: Path) -> bool:
    run_git(workspace_dir, ["reset", "--hard", "HEAD"])
    run_git(workspace_dir, ["clean", "-fd"])
    return True
