import os
from pathlib import Path
from app.config import settings

class SecurityError(Exception):
    pass

def validate_safe_path(base_dir: Path, requested_path: str | Path) -> Path:
    """
    Validates that requested_path is strictly within base_dir.
    Rejects directory traversal attacks (e.g. ../../etc/passwd).
    """
    resolved_base = base_dir.resolve()
    target = (base_dir / requested_path).resolve()
    
    try:
        target.relative_to(resolved_base)
    except ValueError:
        raise SecurityError(f"Access denied: Path '{requested_path}' escapes workspace boundary.")
    
    return target

def read_file(workspace_dir: Path, relative_path: str, max_bytes: int = 100_000) -> str:
    target = validate_safe_path(workspace_dir, relative_path)
    if not target.exists():
        raise FileNotFoundError(f"File not found: {relative_path}")
    if not target.is_file():
        raise IsADirectoryError(f"Expected file, found directory: {relative_path}")
    
    with open(target, "r", encoding="utf-8", errors="replace") as f:
        content = f.read(max_bytes)
    return content

def create_file(workspace_dir: Path, relative_path: str, content: str) -> None:
    target = validate_safe_path(workspace_dir, relative_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "w", encoding="utf-8") as f:
        f.write(content)

def edit_file(workspace_dir: Path, relative_path: str, old_snippet: str, new_snippet: str) -> None:
    target = validate_safe_path(workspace_dir, relative_path)
    if not target.exists():
        raise FileNotFoundError(f"Cannot edit non-existent file: {relative_path}")
    
    with open(target, "r", encoding="utf-8") as f:
        content = f.read()
        
    if old_snippet not in content:
        raise ValueError(f"Target snippet not found in {relative_path}")
        
    updated = content.replace(old_snippet, new_snippet, 1)
    with open(target, "w", encoding="utf-8") as f:
        f.write(updated)

def write_full_file(workspace_dir: Path, relative_path: str, content: str) -> None:
    target = validate_safe_path(workspace_dir, relative_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "w", encoding="utf-8") as f:
        f.write(content)

def delete_file(workspace_dir: Path, relative_path: str) -> None:
    target = validate_safe_path(workspace_dir, relative_path)
    if not target.exists():
        raise FileNotFoundError(f"File not found for deletion: {relative_path}")
    if target.is_dir():
        import shutil
        shutil.rmtree(target)
    else:
        target.unlink()

def list_directory(workspace_dir: Path, relative_path: str = "") -> list[dict]:
    target = validate_safe_path(workspace_dir, relative_path)
    if not target.exists() or not target.is_dir():
        return []
        
    items = []
    for entry in sorted(os.scandir(target), key=lambda e: (not e.is_dir(), e.name)):
        if entry.name in settings.EXCLUDED_DIRS:
            continue
        rel = Path(entry.path).relative_to(workspace_dir.resolve()).as_posix()
        items.append({
            "name": entry.name,
            "path": rel,
            "type": "directory" if entry.is_dir() else "file",
            "size": entry.stat().st_size if entry.is_file() else None
        })
    return items

def build_directory_tree(workspace_dir: Path, current_path: Path | None = None) -> list[dict]:
    if current_path is None:
        current_path = workspace_dir.resolve()
        
    tree = []
    try:
        entries = sorted(os.scandir(current_path), key=lambda e: (not e.is_dir(), e.name.lower()))
    except (PermissionError, FileNotFoundError):
        return []
        
    for entry in entries:
        if entry.name in settings.EXCLUDED_DIRS:
            continue
        rel = Path(entry.path).relative_to(workspace_dir.resolve()).as_posix()
        if entry.is_dir():
            tree.append({
                "name": entry.name,
                "path": rel,
                "type": "directory",
                "children": build_directory_tree(workspace_dir, Path(entry.path))
            })
        else:
            tree.append({
                "name": entry.name,
                "path": rel,
                "type": "file",
                "size": entry.stat().st_size
            })
    return tree
