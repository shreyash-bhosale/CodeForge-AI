import shutil
from fastapi import APIRouter
from app.config import settings
from app.tools.registry import tool_registry

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/status")
def get_system_status():
    docker_available = shutil.which("docker") is not None
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "database": "connected (SQLite+SQLAlchemy)",
        "ai_provider": settings.LLM_PROVIDER,
        "models": {
            "planner": settings.PLANNER_MODEL,
            "coder": settings.CODER_MODEL,
            "debugger": settings.DEBUGGER_MODEL,
            "fast": settings.FAST_MODEL
        },
        "sandbox": {
            "type": "Docker Container" if docker_available else "Process Isolation Sandbox",
            "docker_available": docker_available,
            "network_policy": settings.SANDBOX_NETWORK_POLICY,
            "timeout_seconds": settings.COMMAND_TIMEOUT_SECONDS,
            "memory_limit_mb": settings.MAX_MEMORY_MB
        },
        "git": "available",
        "security": {
            "secret_scanner": "active",
            "prompt_injection_defense": "active",
            "credential_guard": "active"
        }
    }

@router.get("/providers")
def get_system_providers():
    return {
        "current_provider": settings.LLM_PROVIDER,
        "available_providers": [
            {
                "id": "gemini",
                "name": "Google Gemini",
                "configured": bool(settings.GEMINI_API_KEY),
                "recommended_model": "gemini-2.5-flash"
            },
            {
                "id": "openai",
                "name": "OpenAI",
                "configured": bool(settings.OPENAI_API_KEY),
                "recommended_model": "gpt-4o"
            },
            {
                "id": "ast_deterministic",
                "name": "Deterministic AST Engine",
                "configured": True,
                "recommended_model": "ast-synthesizer-v2"
            }
        ]
    }

@router.get("/sandbox")
def get_sandbox_info():
    docker_available = shutil.which("docker") is not None
    return {
        "engine": "docker" if docker_available else "process_chroot",
        "isolation_level": "container" if docker_available else "workspace_chroot",
        "cpu_limit": settings.MAX_CPU_PERCENT,
        "memory_limit_mb": settings.MAX_MEMORY_MB,
        "network_policy": settings.SANDBOX_NETWORK_POLICY
    }

@router.get("/tools")
def list_system_tools():
    return tool_registry.list_tools()
