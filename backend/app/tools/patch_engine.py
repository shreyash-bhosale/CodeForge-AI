import ast
import shutil
import difflib
from pathlib import Path
from typing import Dict, List, Optional
from app.tools.filesystem import validate_safe_path, SecurityError
from app.security.secret_guard import CredentialGuard

class PatchValidationError(Exception):
    pass

class PatchValidator:
    """
    Validates AI-generated code patches before application to workspace.
    Ensures path containment, protects secret files, and verifies Python AST syntax.
    """
    @classmethod
    def validate_patch_target(cls, workspace_dir: Path, relative_path: str, requires_approval_for_credentials: bool = True) -> Path:
        target = validate_safe_path(workspace_dir, relative_path)
        if CredentialGuard.is_protected_file(relative_path) and requires_approval_for_credentials:
            raise PatchValidationError(f"Target '{relative_path}' is a protected credential/config file requiring explicit approval.")
        return target

    @classmethod
    def validate_code_syntax(cls, file_path: str, content: str) -> None:
        """
        Ensures modified code doesn't introduce syntax errors.
        Currently performs AST validation for Python.
        """
        if file_path.endswith(".py"):
            try:
                ast.parse(content, filename=file_path)
            except SyntaxError as e:
                raise PatchValidationError(f"Syntax error introduced in {file_path} at line {e.lineno}: {e.msg}")

class PatchApplier:
    """
    Applies surgical hunks or full-file replacements safely to workspace.
    """
    @classmethod
    def apply_replacement(
        cls,
        workspace_dir: Path,
        relative_path: str,
        new_content: str,
        validate_syntax: bool = True
    ) -> None:
        target = PatchValidator.validate_patch_target(workspace_dir, relative_path)
        
        if validate_syntax:
            PatchValidator.validate_code_syntax(relative_path, new_content)

        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(new_content)

    @classmethod
    def apply_hunk(
        cls,
        workspace_dir: Path,
        relative_path: str,
        old_hunk: str,
        new_hunk: str,
        validate_syntax: bool = True
    ) -> None:
        target = PatchValidator.validate_patch_target(workspace_dir, relative_path)
        if not target.exists():
            raise PatchValidationError(f"Cannot apply hunk to non-existent file: {relative_path}")

        current_content = target.read_text(encoding="utf-8", errors="replace")
        if old_hunk not in current_content:
            # Try normalized whitespace
            cleaned_curr = "\n".join(line.rstrip() for line in current_content.splitlines())
            cleaned_old = "\n".join(line.rstrip() for line in old_hunk.splitlines())
            if cleaned_old not in cleaned_curr:
                raise PatchValidationError(f"Hunk target snippet not found in {relative_path}")
            new_content = current_content.replace(old_hunk.strip(), new_hunk.strip(), 1)
        else:
            new_content = current_content.replace(old_hunk, new_hunk, 1)

        if validate_syntax:
            PatchValidator.validate_code_syntax(relative_path, new_content)

        with open(target, "w", encoding="utf-8") as f:
            f.write(new_content)

class PatchRollback:
    """
    Maintains snapshot backups of modified files during a task execution run
    to enable instant surgical rollback if a patch introduces failures.
    """
    def __init__(self, workspace_dir: Path):
        self.workspace_dir = workspace_dir
        self.snapshots: Dict[str, str] = {}

    def capture(self, relative_path: str) -> None:
        target = self.workspace_dir / relative_path
        if target.exists() and target.is_file():
            self.snapshots[relative_path] = target.read_text(encoding="utf-8", errors="replace")

    def rollback_all(self) -> None:
        for rel_path, content in self.snapshots.items():
            target = self.workspace_dir / rel_path
            target.parent.mkdir(parents=True, exist_ok=True)
            with open(target, "w", encoding="utf-8") as f:
                f.write(content)
