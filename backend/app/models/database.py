import json
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, Boolean, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="")
    role = Column(String(50), default="developer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False)
    token = Column(String(500), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RepositoryModel(Base):
    __tablename__ = "repositories"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(50), default="local")
    source_path = Column(Text, nullable=True)
    workspace_path = Column(Text, nullable=False)
    default_branch = Column(String(100), default="main")
    analysis_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

class TaskModel(Base):
    __tablename__ = "tasks"
    
    id = Column(String(36), primary_key=True)
    repository_id = Column(String(36), nullable=False)
    request = Column(Text, nullable=False)
    status = Column(String(50), default="INITIAL")
    current_stage = Column(String(50), default="INITIAL")
    retry_count = Column(Integer, default=0)
    auto_approve = Column(Boolean, default=True)
    plan_json = Column(Text, nullable=True)
    verification_json = Column(Text, nullable=True)
    git_diff = Column(Text, default="")
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class TaskEventModel(Base):
    __tablename__ = "task_events"
    
    id = Column(String(36), primary_key=True)
    task_id = Column(String(36), nullable=False)
    agent = Column(String(50), nullable=False)
    stage = Column(String(50), nullable=False)
    event_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    detail = Column(Text, nullable=True)
    data_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

class ToolCallModel(Base):
    __tablename__ = "tool_calls"

    id = Column(String(36), primary_key=True)
    task_id = Column(String(36), nullable=False)
    agent = Column(String(50), nullable=False)
    tool = Column(String(100), nullable=False)
    arguments_json = Column(Text, default="{}")
    output = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    exit_code = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    risk_level = Column(String(20), default="LOW")
    created_at = Column(DateTime, default=datetime.utcnow)

class EvaluationModel(Base):
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True)
    benchmark_id = Column(String(50), nullable=False)
    task_prompt = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING")
    passed = Column(Boolean, default=False)
    retries = Column(Integer, default=0)
    tests_summary = Column(String(100), default="0/0")
    duration_seconds = Column(Float, default=0.0)
    precision_score = Column(String(20), default="100%")
    report_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

class TestRunModel(Base):
    __tablename__ = "test_runs"

    id = Column(String(36), primary_key=True)
    task_id = Column(String(36), nullable=False)
    command = Column(String(255), nullable=False)
    exit_code = Column(Integer, default=0)
    passed = Column(Boolean, default=False)
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

# Database Engine & Session setup
import logging
import time
from sqlalchemy import text

logger = logging.getLogger("codeforge.database")

def validate_database_url(url: str) -> None:
    """
    Validates the configured database connection URL scheme.
    Raises ValueError with actionable instructions if the scheme is unrecognized.
    """
    if not url:
        return
    valid_prefixes = ("postgresql://", "postgres://", "postgresql+psycopg2://", "sqlite://")
    if not any(url.lower().startswith(p) for p in valid_prefixes):
        scheme = url.split("://")[0] if "://" in url else "unknown"
        raise ValueError(
            f"Invalid DATABASE_URL scheme '{scheme}://'. "
            "Supported database schemes for CodeForge AI are PostgreSQL ('postgresql://') "
            "for Supabase/managed cloud databases, or SQLite ('sqlite:///')."
        )

db_url = settings.resolved_database_url
validate_database_url(db_url)

if settings.is_postgres:
    # Production-ready PostgreSQL connection pooling for Supabase / Cloud Postgres
    engine = create_engine(
        db_url,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_recycle=300,
        pool_pre_ping=True
    )
else:
    # Local developer fallback: SQLite
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_db_connection() -> dict:
    """
    Performs a lightweight connectivity check against the active database.
    Returns status, dialect, latency in ms, and any error message without exposing credentials.
    """
    start_time = time.perf_counter()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "connected",
            "dialect": engine.dialect.name,
            "latency_ms": latency_ms,
            "error": None
        }
    except Exception as e:
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        error_msg = str(e)
        logger.error(f"Database health check failed: {error_msg}")
        return {
            "status": "error",
            "dialect": engine.dialect.name,
            "latency_ms": latency_ms,
            "error": error_msg
        }

def init_db():
    """
    Initializes and verifies the database schema.
    Creates all missing tables if they do not exist.
    """
    try:
        check = check_db_connection()
        if check["status"] != "connected":
            logger.warning(
                f"Initial database probe encountered an error on dialect '{check['dialect']}': {check['error']}. "
                "Ensure DATABASE_URL is reachable and credentials are valid."
            )
        Base.metadata.create_all(bind=engine)
        logger.info(f"Database schema initialized successfully (Dialect: {engine.dialect.name}).")
    except Exception as err:
        logger.error(
            f"Failed to initialize database schema: {err}. "
            "If using Supabase/PostgreSQL, verify your host, credentials, SSL mode, and firewall settings."
        )
        raise

