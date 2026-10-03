from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import init_db
from app.api.routes_repositories import router as repos_router
from app.api.routes_tasks import router as tasks_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print(f"[{settings.APP_NAME}] Backend initialized successfully.")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Agentic AI Software Engineering Platform backend orchestrating Understand -> Plan -> Implement -> Test -> Debug -> Verify -> Ship",
    version="1.0.0",
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

app.include_router(repos_router, prefix=settings.API_V1_PREFIX)
app.include_router(tasks_router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "llm_provider": settings.LLM_PROVIDER,
        "model": settings.LLM_MODEL
    }
