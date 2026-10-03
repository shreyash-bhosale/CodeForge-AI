from typing import Any, Literal
from pydantic import BaseModel, Field

class ToolCallRequest(BaseModel):
    tool: str
    arguments: dict[str, Any] = Field(default_factory=dict)

class ToolCallResult(BaseModel):
    tool: str
    success: bool
    output: str | None = None
    error: str | None = None
    exit_code: int | None = None
    duration_ms: int = 0

class ImplementationPlan(BaseModel):
    objective: str
    summary: str
    files_to_inspect: list[str] = Field(default_factory=list)
    files_to_modify: list[str] = Field(default_factory=list)
    files_to_create: list[str] = Field(default_factory=list)
    dependencies: list[str] = Field(default_factory=list)
    implementation_steps: list[str] = Field(default_factory=list)
    verification_commands: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    requires_user_approval: bool = False

FailureCategory = Literal[
    "SYNTAX_ERROR",
    "TYPE_ERROR",
    "IMPORT_ERROR",
    "DEPENDENCY_ERROR",
    "TEST_FAILURE",
    "BUILD_FAILURE",
    "LINT_FAILURE",
    "RUNTIME_ERROR",
    "CONFIGURATION_ERROR",
    "UNKNOWN"
]

class FailureClassification(BaseModel):
    category: FailureCategory
    summary: str
    affected_files: list[str] = Field(default_factory=list)
    root_cause: str
    suggested_fix: str

class DebuggingFixPlan(BaseModel):
    attempt_number: int
    classification: FailureClassification
    files_to_edit: list[str] = Field(default_factory=list)
    fix_description: str
    actions: list[dict[str, Any]] = Field(default_factory=list)

class VerificationReport(BaseModel):
    status: Literal["PASSED", "FAILED"]
    summary: str
    checks_executed: list[str] = Field(default_factory=list)
    tests_passed: bool
    build_passed: bool
    modified_files: list[str] = Field(default_factory=list)
    git_diff_summary: str = ""
    suggested_next_steps: list[str] = Field(default_factory=list)
