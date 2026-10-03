import re
from pathlib import Path
from app.config import settings

def search_code(workspace_dir: Path, query: str, is_regex: bool = False, max_results: int = 40) -> list[dict]:
    results = []
    base_path = workspace_dir.resolve()
    
    flags = re.IGNORECASE
    if is_regex:
        try:
            pattern = re.compile(query, flags)
        except re.error:
            pattern = re.compile(re.escape(query), flags)
    else:
        pattern = re.compile(re.escape(query), flags)

    for path in base_path.rglob("*"):
        if not path.is_file():
            continue
            
        # Check exclusions
        parts = path.relative_to(base_path).parts
        if any(part in settings.EXCLUDED_DIRS or part.startswith(".") for part in parts):
            continue
            
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                for line_idx, line in enumerate(f, start=1):
                    if pattern.search(line):
                        results.append({
                            "file": path.relative_to(base_path).as_posix(),
                            "line": line_idx,
                            "content": line.strip()
                        })
                        if len(results) >= max_results:
                            return results
        except Exception:
            continue
            
    return results

def find_files(workspace_dir: Path, pattern: str) -> list[str]:
    base_path = workspace_dir.resolve()
    matches = []
    for path in base_path.rglob(pattern):
        parts = path.relative_to(base_path).parts
        if any(part in settings.EXCLUDED_DIRS for part in parts):
            continue
        matches.append(path.relative_to(base_path).as_posix())
    return matches
