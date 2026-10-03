from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CodeForge AI — Autonomous AI Coding Engineer"
    API_V1_PREFIX: str = "/api"
    DEBUG: bool = True
    
    # Storage & Workspace paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    SANDBOX_DIR: Path = BASE_DIR / "sandboxes"
    SAMPLE_REPO_DIR: Path = BASE_DIR / "sample_repo"
    # Database & Cache
    DB_URL: str = ""
    DATABASE_URL: str = ""
    REDIS_URL: str = ""

    # Application URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    @property
    def resolved_database_url(self) -> str:
        raw = (self.DATABASE_URL or self.DB_URL or "").strip()
        if not raw or "codeforge.db" in raw and "sqlite" in raw:
            return f"sqlite:///{self.DATA_DIR}/codeforge.db"
        if raw.startswith("postgres://"):
            return "postgresql://" + raw[len("postgres://"):]
        return raw

    @property
    def is_postgres(self) -> bool:
        url = self.resolved_database_url.lower()
        return url.startswith("postgresql://") or url.startswith("postgres://")
    
    # LLM Settings & Provider Selection
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_PROVIDER: str = "gemini"  # "gemini", "openai", or "heuristic"
    LLM_MODEL: str = "gemini-2.5-flash"
    
    PLANNER_MODEL: str = "gemini-2.5-flash"
    CODER_MODEL: str = "gemini-2.5-flash"
    DEBUGGER_MODEL: str = "gemini-2.5-flash"
    FAST_MODEL: str = "gemini-2.5-flash"
    
    # Agent Execution Policies
    MAX_AGENT_ITERATIONS: int = 5
    MAX_DEBUG_ATTEMPTS: int = 3
    COMMAND_TIMEOUT_SECONDS: int = 60
    
    # Security & Auth Settings
    JWT_SECRET: str = "codeforge-autonomous-engineer-security-key-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Sandboxing & Resource Limits
    SANDBOX_ENABLED: bool = True
    SANDBOX_NETWORK_POLICY: str = "NONE"  # "NONE", "ALLOWLIST", "FULL"
    MAX_CPU_PERCENT: int = 80
    MAX_MEMORY_MB: int = 512
    
    # GitHub Integration
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    
    # Common ignore patterns
    EXCLUDED_DIRS: set[str] = {
        "node_modules", ".git", "dist", "build", "coverage", 
        ".next", "venv", ".venv", "__pycache__", "vendor", ".pytest_cache"
    }

    class Config:
        env_file = (".env", "../.env")
        extra = "ignore"

settings = Settings()
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.SANDBOX_DIR.mkdir(parents=True, exist_ok=True)
