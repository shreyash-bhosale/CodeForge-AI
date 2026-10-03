from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, Field
from app.schemas.agent import ImplementationPlan, VerificationReport

TaskStatus = Literal[
    "INITIAL",
    "ANALYZING",
    "PLANNING",
    "AWAITING_APPROVAL",
    "IMPLEMENTING",
    "TESTING",
    "DEBUGGING",
    "VERIFYING",
    "COMPLETED",
    "FAILED",
    "CANCELLED"
]

class TaskCreate(BaseModel):
    repository_id: str
    request: str
    auto_approve: bool = True

class TaskEvent(BaseModel):
    id: str
    task_id: str
    agent: str  # "orchestrator", "analyzer", "planner", "coder", "executor", "debugger", "verifier"
    stage: TaskStatus
    event_type: str  # "status_change", "log", "plan_ready", "tool_call", "test_result", "diff", "error", "summary"
    title: str
    detail: str | None = None
    data: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TaskOut(BaseModel):
    id: str
    repository_id: str
    request: str
    status: TaskStatus
    current_stage: str
    retry_count: int = 0
    plan: ImplementationPlan | None = None
    verification: VerificationReport | None = None
    git_diff: str = ""
    error_message: str | None = None
    started_at: datetime
    completed_at: datetime | None = None
