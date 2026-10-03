import asyncio
import json
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session
from app.models.database import SessionLocal, TaskModel, TaskEventModel, RepositoryModel
from app.schemas.task import TaskCreate, TaskOut, TaskEvent
from app.schemas.agent import ImplementationPlan, VerificationReport
from app.agents.orchestrator import orchestrator, event_broker
from app.tools.git_adapter import restore_git

router = APIRouter(tags=["Tasks"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _task_to_out(t: TaskModel) -> TaskOut:
    plan = ImplementationPlan(**json.loads(t.plan_json)) if t.plan_json else None
    verification = VerificationReport(**json.loads(t.verification_json)) if t.verification_json else None
    return TaskOut(
        id=t.id,
        repository_id=t.repository_id,
        request=t.request,
        status=t.status,
        current_stage=t.current_stage,
        retry_count=t.retry_count,
        plan=plan,
        verification=verification,
        git_diff=t.git_diff or "",
        error_message=t.error_message,
        started_at=t.started_at,
        completed_at=t.completed_at
    )

@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(TaskModel).order_by(TaskModel.started_at.desc()).all()
    return [_task_to_out(t) for t in tasks]

@router.post("/repositories/{id}/tasks", response_model=TaskOut)
def start_task(id: str, req: TaskCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    task_id = str(uuid.uuid4())
    task = TaskModel(
        id=task_id,
        repository_id=id,
        request=req.request,
        status="INITIAL",
        current_stage="INITIAL",
        auto_approve=req.auto_approve,
        started_at=datetime.utcnow()
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Launch autonomous agent loop asynchronously in the background
    background_tasks.add_task(
        orchestrator.run_task,
        task_id=task_id,
        workspace_path=Path(repo.workspace_path),
        task_prompt=req.request
    )

    return _task_to_out(task)

@router.get("/tasks/{id}", response_model=TaskOut)
def get_task(id: str, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_out(task)

@router.get("/tasks/{id}/events")
async def stream_task_events(id: str):
    """
    Real-time Server-Sent Events (SSE) stream for agent telemetry and live loop feedback.
    """
    queue = event_broker.subscribe(id)

    async def event_generator():
        # First send any previously saved events for this task
        try:
            with SessionLocal() as db:
                past_events = db.query(TaskEventModel).filter(TaskEventModel.task_id == id).order_by(TaskEventModel.created_at.asc()).all()
                for pe in past_events:
                    yield {
                        "event": "agent_event",
                        "data": json.dumps({
                            "id": pe.id,
                            "task_id": pe.task_id,
                            "agent": pe.agent,
                            "stage": pe.stage,
                            "event_type": pe.event_type,
                            "title": pe.title,
                            "detail": pe.detail,
                            "data": json.loads(pe.data_json),
                            "timestamp": pe.created_at.isoformat()
                        })
                    }

            # Then stream live events from queue
            while True:
                try:
                    event: TaskEvent = await asyncio.wait_for(queue.get(), timeout=25.0)
                    yield {
                        "event": "agent_event",
                        "data": json.dumps({
                            "id": event.id,
                            "task_id": event.task_id,
                            "agent": event.agent,
                            "stage": event.stage,
                            "event_type": event.event_type,
                            "title": event.title,
                            "detail": event.detail,
                            "data": event.data,
                            "timestamp": event.timestamp.isoformat()
                        })
                    }
                    if event.stage in ["COMPLETED", "FAILED", "CANCELLED"] and event.event_type in ["summary", "error"]:
                        break
                except asyncio.TimeoutError:
                    # Send keep-alive ping
                    yield {"event": "ping", "data": "keep-alive"}
        finally:
            event_broker.unsubscribe(id, queue)

    return EventSourceResponse(event_generator())

@router.get("/tasks/{id}/diff")
def get_task_diff(id: str, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"diff": task.git_diff or ""}

@router.post("/tasks/{id}/rollback")
def rollback_task(id: str, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == task.repository_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    restore_git(Path(repo.workspace_path))
    task.git_diff = ""
    task.status = "CANCELLED"
    task.error_message = "Rolled back changes by user"
    db.commit()
    return {"success": True, "message": "Repository reverted to baseline commit."}
