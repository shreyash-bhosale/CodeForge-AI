import ast
import re
from pathlib import Path

def parse_python_symbols(content: str) -> dict:
    symbols = {
        "classes": [],
        "functions": [],
        "imports": [],
        "routes": []
    }
    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                symbols["classes"].append({
                    "name": node.name,
                    "lineno": node.lineno
                })
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                decorators = []
                for d in node.decorator_list:
                    if isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute):
                        decorators.append(f"{d.func.value.id if hasattr(d.func.value, 'id') else ''}.{d.func.attr}")
                    elif isinstance(d, ast.Attribute):
                        decorators.append(f"{d.value.id if hasattr(d.value, 'id') else ''}.{d.attr}")
                    elif isinstance(d, ast.Name):
                        decorators.append(d.id)
                
                func_info = {
                    "name": node.name,
                    "lineno": node.lineno,
                    "decorators": decorators
                }
                symbols["functions"].append(func_info)
                if any("get" in dec or "post" in dec or "put" in dec or "delete" in dec or "patch" in dec for dec in decorators):
                    symbols["routes"].append(func_info)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    symbols["imports"].append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                for alias in node.names:
                    symbols["imports"].append(f"{module}.{alias.name}")
    except Exception:
        pass
    return symbols

def parse_javascript_symbols(content: str) -> dict:
    symbols = {
        "functions": [],
        "classes": [],
        "imports": [],
        "exports": []
    }
    # Simple regex parsing for JS/TS
    func_pattern = re.compile(r'(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(')
    class_pattern = re.compile(r'class\s+([a-zA-Z0-9_$]+)')
    import_pattern = re.compile(r'import\s+.*?\s+from\s+[\'"](.*?)[\'"]')
    
    for match in func_pattern.finditer(content):
        name = match.group(1) or match.group(2)
        if name:
            symbols["functions"].append({"name": name})
            
    for match in class_pattern.finditer(content):
        symbols["classes"].append({"name": match.group(1)})
        
    for match in import_pattern.finditer(content):
        symbols["imports"].append(match.group(1))
        
    return symbols

def extract_file_symbols(file_path: Path) -> dict:
    if not file_path.exists():
        return {}
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        if file_path.suffix == ".py":
            return parse_python_symbols(content)
        elif file_path.suffix in [".js", ".ts", ".jsx", ".tsx"]:
            return parse_javascript_symbols(content)
    except Exception:
        pass
    return {}
