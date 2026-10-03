from datetime import datetime
from pydantic import BaseModel, Field

class RepositoryCreate(BaseModel):
    name: str
    source_type: str = "local"  # "local", "sample", "github"
    source_path: str | None = None
    remote_url: str | None = None
    default_branch: str = "main"

class RepositoryTreeItem(BaseModel):
    name: str
    path: str
    type: str  # "file" or "directory"
    size: int | None = None
    children: list["RepositoryTreeItem"] | None = None

class RepositoryAnalysis(BaseModel):
    languages: list[str] = Field(default_factory=list)
    frameworks: list[str] = Field(default_factory=list)
    package_managers: list[str] = Field(default_factory=list)
    entry_points: list[str] = Field(default_factory=list)
    test_frameworks: list[str] = Field(default_factory=list)
    build_commands: list[str] = Field(default_factory=list)
    important_directories: list[str] = Field(default_factory=list)
    architecture_summary: str = ""
    candidate_files: list[str] = Field(default_factory=list)

class RepositoryOut(BaseModel):
    id: str
    name: str
    source_type: str
    workspace_path: str
    default_branch: str
    analysis: RepositoryAnalysis | None = None
    created_at: datetime
