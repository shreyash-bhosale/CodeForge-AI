from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import init_db, check_db_connection
from app.api.routes_repositories import router as repos_router
from app.api.routes_tasks import router as tasks_router
from app.api.routes_auth import router as auth_router
from app.api.routes_evaluations import router as evaluations_router
from app.api.routes_system import router as system_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db_check = check_db_connection()
    print(f"[{settings.APP_NAME}] Backend initialized. Database: {db_check['dialect']} ({db_check['status']}, latency: {db_check['latency_ms']}ms).")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Agentic AI Software Engineering Platform backend orchestrating Understand -> Plan -> Implement -> Test -> Debug -> Verify -> Ship",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(repos_router, prefix=settings.API_V1_PREFIX)
app.include_router(tasks_router, prefix=settings.API_V1_PREFIX)
app.include_router(evaluations_router, prefix=settings.API_V1_PREFIX)
app.include_router(system_router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
def health():
    db_check = check_db_connection()
    return {
        "status": "healthy" if db_check["status"] == "connected" else "degraded",
        "service": settings.APP_NAME,
        "database": {
            "status": db_check["status"],
            "dialect": db_check["dialect"],
            "latency_ms": db_check["latency_ms"]
        },
        "llm_provider": settings.LLM_PROVIDER,
        "model": settings.LLM_MODEL
    }
