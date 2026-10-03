from pathlib import Path
from app.config import settings
from app.schemas.repository import RepositoryAnalysis

class RepositoryAgent:
    def analyze(self, workspace_dir: Path) -> RepositoryAnalysis:
        languages = set()
        frameworks = set()
        package_managers = set()
        entry_points = []
        test_frameworks = set()
        build_commands = []
        important_dirs = set()
        
        base = workspace_dir.resolve()
        
        # Scan files
        for path in base.rglob("*"):
            if not path.is_file():
                continue
            rel = path.relative_to(base).as_posix()
            parts = path.relative_to(base).parts
            if any(p in settings.EXCLUDED_DIRS or p.startswith(".") for p in parts):
                continue
                
            # Collect important top-level directories
            if len(parts) > 1 and parts[0] not in settings.EXCLUDED_DIRS:
                important_dirs.add(parts[0])

            # Language detection
            suffix = path.suffix.lower()
            name = path.name.lower()
            
            if suffix == ".py":
                languages.add("Python")
            elif suffix in [".js", ".jsx"]:
                languages.add("JavaScript")
            elif suffix in [".ts", ".tsx"]:
                languages.add("TypeScript")
            elif suffix == ".rs":
                languages.add("Rust")
            elif suffix == ".go":
                languages.add("Go")

            # Framework & Config detection
            if name == "requirements.txt" or name == "pyproject.toml":
                package_managers.add("pip")
                try:
                    content = path.read_text(encoding="utf-8", errors="ignore").lower()
                    if "fastapi" in content:
                        frameworks.add("FastAPI")
                    if "flask" in content:
                        frameworks.add("Flask")
                    if "django" in content:
                        frameworks.add("Django")
                    if "pytest" in content:
                        test_frameworks.add("pytest")
                except Exception:
                    pass

            if name == "package.json":
                package_managers.add("npm")
                try:
                    content = path.read_text(encoding="utf-8", errors="ignore").lower()
                    if "next" in content:
                        frameworks.add("Next.js")
                    if "react" in content:
                        frameworks.add("React")
                    if "express" in content:
                        frameworks.add("Express")
                    if "jest" in content:
                        test_frameworks.add("jest")
                    if "vitest" in content:
                        test_frameworks.add("vitest")
                except Exception:
                    pass

            # Detect test files
            if "test" in name and suffix in [".py", ".js", ".ts"]:
                if suffix == ".py":
                    test_frameworks.add("pytest")
                elif suffix in [".js", ".ts"]:
                    test_frameworks.add("npm test")

            # Detect entry points
            if name in ["main.py", "app.py", "index.py", "server.py", "index.ts", "index.js", "app.tsx", "main.ts"]:
                entry_points.append(rel)

        # Decide default build/test commands
        if "pytest" in test_frameworks or "Python" in languages:
            build_commands.append("pytest -v")
        if "npm test" in test_frameworks or "JavaScript" in languages or "TypeScript" in languages:
            build_commands.append("npm test")

        lang_list = sorted(list(languages)) or ["Unknown"]
        fw_list = sorted(list(frameworks))
        
        summary = (
            f"Detected {', '.join(lang_list)} project"
            + (f" utilizing {', '.join(fw_list)}" if fw_list else "")
            + f" with {len(entry_points)} key entry point(s)."
        )

        return RepositoryAnalysis(
            languages=lang_list,
            frameworks=fw_list,
            package_managers=sorted(list(package_managers)),
            entry_points=sorted(entry_points),
            test_frameworks=sorted(list(test_frameworks)),
            build_commands=build_commands,
            important_directories=sorted(list(important_dirs)),
            architecture_summary=summary,
            candidate_files=entry_points[:5]
        )

repository_agent = RepositoryAgent()
