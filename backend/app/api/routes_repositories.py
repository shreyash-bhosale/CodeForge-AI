import json
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.config import settings
from app.models.database import SessionLocal, RepositoryModel
from app.schemas.repository import RepositoryCreate, RepositoryOut, RepositoryAnalysis
from app.tools.filesystem import build_directory_tree, read_file
from app.sandbox.manager import sandbox_manager
from app.agents.repository_agent import repository_agent

router = APIRouter(prefix="/repositories", tags=["Repositories"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[RepositoryOut])
def list_repositories(db: Session = Depends(get_db)):
    repos = db.query(RepositoryModel).all()
    results = []
    for r in repos:
        analysis_data = json.loads(r.analysis_json) if r.analysis_json else None
        results.append(RepositoryOut(
            id=r.id,
            name=r.name,
            source_type=r.source_type,
            workspace_path=r.workspace_path,
            default_branch=r.default_branch,
            analysis=RepositoryAnalysis(**analysis_data) if analysis_data else None,
            created_at=r.created_at
        ))
    return results

@router.post("", response_model=RepositoryOut)
def create_repository(req: RepositoryCreate, db: Session = Depends(get_db)):
    repo_id = str(uuid.uuid4())
    
    # Check if sample repository requested
    if req.source_type == "sample" or not req.source_path:
        source_dir = settings.SAMPLE_REPO_DIR
    else:
        source_dir = Path(req.source_path)

    # Provision isolated sandbox workspace
    ws_dir = sandbox_manager.create_sandbox_workspace(source_path=source_dir, name=f"repo_{repo_id[:8]}")
    
    # Automatically analyze
    analysis = repository_agent.analyze(ws_dir)

    repo_model = RepositoryModel(
        id=repo_id,
        name=req.name,
        source_type=req.source_type,
        source_path=str(source_dir),
        workspace_path=str(ws_dir),
        default_branch=req.default_branch,
        analysis_json=json.dumps(analysis.model_dump())
    )
    db.add(repo_model)
    db.commit()
    db.refresh(repo_model)

    return RepositoryOut(
        id=repo_model.id,
        name=repo_model.name,
        source_type=repo_model.source_type,
        workspace_path=repo_model.workspace_path,
        default_branch=repo_model.default_branch,
        analysis=analysis,
        created_at=repo_model.created_at
    )

@router.get("/{id}", response_model=RepositoryOut)
def get_repository(id: str, db: Session = Depends(get_db)):
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    analysis_data = json.loads(repo.analysis_json) if repo.analysis_json else None
    return RepositoryOut(
        id=repo.id,
        name=repo.name,
        source_type=repo.source_type,
        workspace_path=repo.workspace_path,
        default_branch=repo.default_branch,
        analysis=RepositoryAnalysis(**analysis_data) if analysis_data else None,
        created_at=repo.created_at
    )

@router.get("/{id}/tree")
def get_repository_tree(id: str, db: Session = Depends(get_db)):
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    ws_dir = Path(repo.workspace_path)
    return build_directory_tree(ws_dir)

@router.get("/{id}/file")
def get_file_content(id: str, path: str, db: Session = Depends(get_db)):
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    try:
        content = read_file(Path(repo.workspace_path), path)
        return {"path": path, "content": content}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
