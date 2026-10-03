import pytest
from pathlib import Path
from app.intelligence.code_parser import parse_python_symbols, parse_javascript_symbols
from app.intelligence.repository_graph import RepositoryGraph

def test_python_symbol_parsing():
    code = (
        "import os\n"
        "from fastapi import FastAPI\n\n"
        "app = FastAPI()\n\n"
        "@app.get('/health')\n"
        "def health_check():\n"
        "    return {'status': 'ok'}\n\n"
        "class UserService:\n"
        "    def get_user(self, user_id: int):\n"
        "        pass\n"
    )
    symbols = parse_python_symbols(code)
    assert len(symbols["classes"]) == 1
    assert symbols["classes"][0]["name"] == "UserService"
    assert len(symbols["functions"]) == 2
    assert len(symbols["routes"]) == 1
    assert "health_check" in [f["name"] for f in symbols["routes"]]

def test_javascript_symbol_parsing():
    js_code = (
        "import React from 'react';\n"
        "export function UserAvatar() { return <div />; }\n"
        "export const computeHash = async (val) => { return val; };\n"
        "export class AuthManager {}\n"
    )
    symbols = parse_javascript_symbols(js_code)
    assert "UserAvatar" in [f["name"] for f in symbols["functions"]]
    assert "computeHash" in [f["name"] for f in symbols["functions"]]
    assert "AuthManager" in [c["name"] for c in symbols["classes"]]

def test_repository_graph(tmp_path: Path):
    ws = tmp_path / "graph_ws"
    ws.mkdir()
    (ws / "main.py").write_text("def run_pipeline():\n    pass\n")
    (ws / "app.py").write_text("from main import run_pipeline\nclass Engine:\n    pass\n")

    graph = RepositoryGraph()
    graph.build_graph(ws)
    summary = graph.get_summary()
    assert summary["total_files_indexed"] == 2
    assert "run_pipeline" in graph.symbols
    assert "Engine" in graph.symbols
