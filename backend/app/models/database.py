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
engine = create_engine(
    f"sqlite:///{settings.DATA_DIR}/codeforge.db",
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
