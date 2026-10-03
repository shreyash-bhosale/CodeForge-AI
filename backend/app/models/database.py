import json
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

Base = declarative_base()

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

# Database Engine & Session setup
# Using SQLite with connect_args for multithread access
engine = create_engine(
    f"sqlite:///{settings.DATA_DIR}/codeforge.db",
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
