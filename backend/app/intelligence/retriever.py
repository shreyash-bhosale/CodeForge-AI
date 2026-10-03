import re
from pathlib import Path
from app.config import settings
from app.intelligence.code_parser import extract_file_symbols

def retrieve_relevant_context(workspace_dir: Path, query: str, max_files: int = 6) -> dict:
    """
    Ranks files based on token relevance, symbols, and task hints.
    """
    base = workspace_dir.resolve()
    query_tokens = set(re.findall(r'\w+', query.lower()))
    scored_files = []

    for path in base.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(base).as_posix()
        parts = path.relative_to(base).parts
        if any(part in settings.EXCLUDED_DIRS or part.startswith(".") for part in parts):
            continue
            
        score = 0
        rel_lower = rel.lower()
        
        # Filename relevance
        for token in query_tokens:
            if token in rel_lower:
                score += 5
                
        # Prioritize routes, api, auth, main, test if matched
        if "test" in rel_lower and any(t in ["test", "verify", "spec", "check"] for t in query_tokens):
            score += 4
            
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")[:25_000]
            content_lower = content.lower()
            for token in query_tokens:
                if len(token) > 2 and token in content_lower:
                    score += content_lower.count(token)
            
            # Extract symbols
            symbols = extract_file_symbols(path)
            symbol_names = [f["name"].lower() for f in symbols.get("functions", [])] + \
                           [c["name"].lower() for c in symbols.get("classes", [])]
            for token in query_tokens:
                if token in symbol_names:
                    score += 6
                    
            if score > 0:
                scored_files.append({
                    "path": rel,
                    "score": score,
                    "symbols": symbols,
                    "snippet": content[:800]
                })
        except Exception:
            continue

    # Sort descending by relevance score
    scored_files.sort(key=lambda x: x["score"], reverse=True)
    top_candidates = scored_files[:max_files]
    
    return {
        "query": query,
        "matched_files": [f["path"] for f in top_candidates],
        "file_details": top_candidates
    }
