import shutil
import uuid
from pathlib import Path
from app.config import settings
from app.tools.git_adapter import init_git_repo

class SandboxManager:
    def __init__(self, sandbox_root: Path = settings.SANDBOX_DIR):
        self.sandbox_root = sandbox_root
        self.sandbox_root.mkdir(parents=True, exist_ok=True)

    def create_sandbox_workspace(self, source_path: Path | None = None, name: str | None = None) -> Path:
        ws_id = name or f"ws_{uuid.uuid4().hex[:10]}"
        ws_dir = (self.sandbox_root / ws_id).resolve()
        
        if ws_dir.exists():
            shutil.rmtree(ws_dir)
            
        ws_dir.mkdir(parents=True, exist_ok=True)
        
        if source_path and source_path.exists():
            # Copy source directory excluding git/venv/node_modules
            def ignore_patterns(path, names):
                return [n for n in names if n in settings.EXCLUDED_DIRS]
            shutil.copytree(source_path, ws_dir, dirs_exist_ok=True, ignore=ignore_patterns)

        # Initialize local git repository snapshot in sandbox
        init_git_repo(ws_dir)
        return ws_dir

    def get_workspace(self, workspace_id: str) -> Path | None:
        target = (self.sandbox_root / workspace_id).resolve()
        if target.exists() and target.is_dir():
            return target
        return None

sandbox_manager = SandboxManager()
