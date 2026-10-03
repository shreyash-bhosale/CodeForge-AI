import re
from pathlib import Path
from typing import Dict, List, Any
from app.config import settings
from app.intelligence.code_parser import extract_file_symbols
from app.intelligence.repository_graph import repository_graph
from app.security.secret_guard import SecretRedactor

def retrieve_relevant_context(workspace_dir: Path, query: str, max_files: int = 6) -> dict:
    """
    Hybrid retriever combining lexical token matching, AST symbol graph queries,
    and secret-redacted contextual snippet extraction.
    """
    base = workspace_dir.resolve()
    query_tokens = set(re.findall(r'\w+', query.lower()))
    scored_files: List[dict] = []

    # Build / refresh repository symbol graph
    repository_graph.build_graph(workspace_dir)

    for path in base.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(base).as_posix()
        parts = path.relative_to(base).parts
        if any(part in settings.EXCLUDED_DIRS or part.startswith(".") for part in parts):
            continue
            
        score = 0
        rel_lower = rel.lower()
        
        # 1. Filename relevance
        for token in query_tokens:
            if token in rel_lower:
                score += 5

        # 2. Architectural entry points bonus
        base_name = Path(rel).name.lower()
        if base_name in ["main.py", "app.py", "server.py", "index.ts", "index.js", "app.ts"]:
            score += 4
                
        # 3. Prioritize test files when query asks for testing/verification
        if "test" in rel_lower and any(t in ["test", "verify", "spec", "assert"] for t in query_tokens):
            score += 5
            
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")[:30_000]
            content_lower = content.lower()
            
            # 3. Lexical frequency
            for token in query_tokens:
                if len(token) > 2 and token in content_lower:
                    score += min(content_lower.count(token), 8)
            
            # 4. AST Symbol matching
            symbols = extract_file_symbols(path)
            symbol_names = [f["name"].lower() for f in symbols.get("functions", [])] + \
                           [c["name"].lower() for c in symbols.get("classes", [])]
            for token in query_tokens:
                if token in symbol_names:
                    score += 8
                    
            # 5. Check if query matches a symbol in repository graph
            for token in query_tokens:
                definitions = repository_graph.find_definition(token)
                if rel in definitions:
                    score += 10

            if score > 0:
                # Redact any accidental secrets from the snippet
                safe_snippet = SecretRedactor.redact(content[:800])
                scored_files.append({
                    "path": rel,
                    "score": score,
                    "symbols": symbols,
                    "snippet": safe_snippet
                })
        except Exception:
            continue

    # Sort descending by relevance score
    scored_files.sort(key=lambda x: x["score"], reverse=True)
    top_candidates = scored_files[:max_files]
    
    return {
        "query": query,
        "matched_files": [f["path"] for f in top_candidates],
        "file_details": top_candidates,
        "graph_summary": repository_graph.get_summary()
    }
