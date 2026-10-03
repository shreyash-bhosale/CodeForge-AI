from pathlib import Path
from typing import Dict, List, Set, Any
from app.config import settings
from app.intelligence.code_parser import extract_file_symbols

class RepositoryGraph:
    """
    Builds and queries an in-memory cross-file symbol and dependency graph
    connecting files, classes, functions, imports, routes, and call relationships.
    """
    def __init__(self):
        self.files: Dict[str, dict] = {}
        self.symbols: Dict[str, List[str]] = {}  # symbol_name -> list of file paths
        self.dependencies: Dict[str, Set[str]] = {} # file -> set of imported modules
        self.callers: Dict[str, Set[str]] = {} # func_name -> set of calling files

    def build_graph(self, workspace_dir: Path) -> None:
        self.files.clear()
        self.symbols.clear()
        self.dependencies.clear()
        self.callers.clear()

        for path in workspace_dir.rglob("*"):
            if not path.is_file():
                continue
            rel = path.relative_to(workspace_dir).as_posix()
            parts = path.relative_to(workspace_dir).parts
            if any(part in settings.EXCLUDED_DIRS or part.startswith(".") for part in parts):
                continue

            file_syms = extract_file_symbols(path)
            self.files[rel] = file_syms
            self.dependencies[rel] = set(file_syms.get("imports", []))

            # Index classes and functions
            for cls in file_syms.get("classes", []):
                name = cls["name"]
                self.symbols.setdefault(name, []).append(rel)
                
            for fn in file_syms.get("functions", []):
                name = fn["name"]
                self.symbols.setdefault(name, []).append(rel)

            # Index callers
            for called_fn in file_syms.get("calls", []):
                self.callers.setdefault(called_fn, set()).add(rel)

    def find_definition(self, symbol_name: str) -> List[str]:
        return self.symbols.get(symbol_name, [])

    def find_callers(self, func_name: str) -> List[str]:
        return list(self.callers.get(func_name, set()))

    def get_related_files(self, file_path: str) -> List[str]:
        related = set()
        file_syms = self.files.get(file_path, {})
        # Files that import this file's module or that this file imports
        module_name = Path(file_path).stem
        for other_file, imports in self.dependencies.items():
            if any(module_name in imp for imp in imports):
                related.add(other_file)
        return list(related)

    def get_summary(self) -> dict:
        total_functions = sum(len(f.get("functions", [])) for f in self.files.values())
        total_classes = sum(len(f.get("classes", [])) for f in self.files.values())
        total_routes = sum(len(f.get("routes", [])) for f in self.files.values())
        return {
            "total_files_indexed": len(self.files),
            "total_symbols": len(self.symbols),
            "total_functions": total_functions,
            "total_classes": total_classes,
            "total_routes": total_routes,
            "modules": list(self.files.keys())
        }

repository_graph = RepositoryGraph()
