import json
import time
import uuid
from datetime import datetime
from typing import Any, Callable, Dict, List
from app.models.database import SessionLocal, ToolCallModel

class ToolPermission:
    READ_ONLY = "READ_ONLY"
    SAFE_WRITE = "SAFE_WRITE"
    EXECUTION = "EXECUTION"
    GIT = "GIT"
    ADMIN = "ADMIN"

class ToolRisk:
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ToolDefinition:
    def __init__(
        self,
        name: str,
        description: str,
        permission: str,
        risk_level: str,
        handler: Callable
    ):
        self.name = name
        self.description = description
        self.permission = permission
        self.risk_level = risk_level
        self.handler = handler

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}

    def register(self, name: str, description: str, permission: str, risk_level: str):
        def decorator(func: Callable):
            self._tools[name] = ToolDefinition(name, description, permission, risk_level, func)
            return func
        return decorator

    def get_tool(self, name: str) -> ToolDefinition | None:
        return self._tools.get(name)

    def list_tools(self) -> List[dict]:
        return [
            {
                "name": t.name,
                "description": t.description,
                "permission": t.permission,
                "risk_level": t.risk_level
            }
            for t in self._tools.values()
        ]

    def audit_call(
        self,
        task_id: str,
        agent: str,
        tool: str,
        arguments: dict,
        output: str | None,
        error: str | None,
        exit_code: int,
        duration_ms: int,
        risk_level: str = ToolRisk.LOW
    ) -> None:
        try:
            with SessionLocal() as db:
                call = ToolCallModel(
                    id=str(uuid.uuid4()),
                    task_id=task_id,
                    agent=agent,
                    tool=tool,
                    arguments_json=json.dumps(arguments),
                    output=output[:4000] if output else None,
                    error=error[:4000] if error else None,
                    exit_code=exit_code,
                    duration_ms=duration_ms,
                    risk_level=risk_level,
                    created_at=datetime.utcnow()
                )
                db.add(call)
                db.commit()
        except Exception as e:
            print(f"[ToolRegistry] Error logging tool call: {e}")

tool_registry = ToolRegistry()
