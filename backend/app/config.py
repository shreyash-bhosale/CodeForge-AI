from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Codeforge AI — Autonomous AI Coding Engineer"
    API_V1_PREFIX: str = "/api"
    DEBUG: bool = True
    
    # Storage & Workspace paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    SANDBOX_DIR: Path = BASE_DIR / "sandboxes"
    SAMPLE_REPO_DIR: Path = BASE_DIR / "sample_repo"
    DB_URL: str = "sqlite+aiosqlite:///./data/codeforge.db"
    
    # LLM Settings
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_PROVIDER: str = "gemini"  # "gemini", "openai", or "heuristic"
    LLM_MODEL: str = "gemini-2.5-flash"
    
    # Agent Execution Policies
    MAX_IMPLEMENTATION_ATTEMPTS: int = 1
    MAX_DEBUG_ATTEMPTS: int = 3
    COMMAND_TIMEOUT_SECONDS: int = 60
    
    # Common ignore patterns
    EXCLUDED_DIRS: set[str] = {
        "node_modules", ".git", "dist", "build", "coverage", 
        ".next", "venv", ".venv", "__pycache__", "vendor", ".pytest_cache"
    }

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.SANDBOX_DIR.mkdir(parents=True, exist_ok=True)
