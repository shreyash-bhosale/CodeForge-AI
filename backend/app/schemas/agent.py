from typing import Any, Literal, List, Dict, Optional
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

class CodePatch(BaseModel):
    file_path: str
    patch_type: Literal["hunk", "replace", "create", "delete"] = "replace"
    old_hunk: Optional[str] = None
    new_hunk: Optional[str] = None
    full_content: Optional[str] = None
    explanation: str = ""

class CodeGenerationResult(BaseModel):
    summary: str
    patches: List[CodePatch] = Field(default_factory=list)
    files_to_create: List[str] = Field(default_factory=list)
    files_to_modify: List[str] = Field(default_factory=list)
    dependencies_to_install: List[str] = Field(default_factory=list)
    tests_to_run: List[str] = Field(default_factory=list)
    estimated_risk: Literal["LOW", "MEDIUM", "HIGH"] = "LOW"

class DebuggingFixPlan(BaseModel):
    attempt_number: int
    classification: FailureClassification
    files_to_edit: list[str] = Field(default_factory=list)
    fix_description: str
    patches: List[CodePatch] = Field(default_factory=list)
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

class CodeReviewIssue(BaseModel):
    file_path: str
    line_number: Optional[int] = None
    severity: Literal["INFO", "WARNING", "ERROR", "SECURITY"] = "INFO"
    message: str

class CodeReviewResult(BaseModel):
    approved: bool
    summary: str
    issues: List[CodeReviewIssue] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)

class GeneratedTest(BaseModel):
    file_path: str
    test_code: str
    description: str
    framework: str = "pytest"
