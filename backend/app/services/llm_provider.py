import json
import os
import re
from typing import Any
import httpx
from app.config import settings
from app.schemas.agent import ImplementationPlan, FailureClassification, DebuggingFixPlan, VerificationReport

class LLMProvider:
    def __init__(self):
        self.gemini_key = os.environ.get("GEMINI_API_KEY", settings.GEMINI_API_KEY)
        self.openai_key = os.environ.get("OPENAI_API_KEY", settings.OPENAI_API_KEY)

    async def generate_plan(self, task_prompt: str, repo_summary: dict, relevant_context: dict) -> ImplementationPlan:
        """
        Generates an ImplementationPlan using Gemini/OpenAI or intelligent heuristic synthesis.
        """
        if self.gemini_key:
            try:
                return await self._call_gemini_plan(task_prompt, repo_summary, relevant_context)
            except Exception as e:
                print(f"[LLMProvider] Gemini error, falling back to heuristic: {e}")
        
        if self.openai_key:
            try:
                return await self._call_openai_plan(task_prompt, repo_summary, relevant_context)
            except Exception as e:
                print(f"[LLMProvider] OpenAI error, falling back to heuristic: {e}")

        # Heuristic autonomous engineering synthesis
        return self._heuristic_plan(task_prompt, repo_summary, relevant_context)

    async def classify_and_fix_failure(
        self,
        task_prompt: str,
        failing_cmd: str,
        stdout: str,
        stderr: str,
        exit_code: int,
        attempt: int,
        modified_files: list[str],
        file_contents: dict[str, str]
    ) -> DebuggingFixPlan:
        """
        Classifies failure and generates targeted patch actions.
        """
        if self.gemini_key:
            try:
                return await self._call_gemini_debug(task_prompt, failing_cmd, stdout, stderr, attempt, modified_files, file_contents)
            except Exception as e:
                print(f"[LLMProvider] Gemini debug error, falling back: {e}")

        return self._heuristic_debug_fix(task_prompt, failing_cmd, stdout, stderr, attempt, modified_files, file_contents)

    async def _call_gemini_plan(self, task_prompt: str, repo_summary: dict, relevant_context: dict) -> ImplementationPlan:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={self.gemini_key}"
        system_instruction = (
            "You are an expert AI software engineer. Analyze the repository context and task objective, "
            "then generate a strict JSON implementation plan adhering to the ImplementationPlan schema."
        )
        prompt = f"""
Task Objective: {task_prompt}
Repository Summary: {json.dumps(repo_summary)}
Relevant Files: {json.dumps(relevant_context.get('matched_files', []))}

Return ONLY a JSON object with:
{{
  "objective": "...",
  "summary": "...",
  "files_to_inspect": [...],
  "files_to_modify": [...],
  "files_to_create": [...],
  "dependencies": [...],
  "implementation_steps": [...],
  "verification_commands": [...],
  "risks": [...],
  "requires_user_approval": false
}}
"""
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "generationConfig": {"responseMimeType": "application/json"}
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)
            return ImplementationPlan(**parsed)

    async def _call_openai_plan(self, task_prompt: str, repo_summary: dict, relevant_context: dict) -> ImplementationPlan:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.openai_key}"}
        prompt = f"""
Task Objective: {task_prompt}
Repository Summary: {json.dumps(repo_summary)}
Relevant Files: {json.dumps(relevant_context.get('matched_files', []))}

Return ONLY valid JSON for ImplementationPlan.
"""
        payload = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": "You are an autonomous coding engineer planner. Output strictly valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_text)
            return ImplementationPlan(**parsed)

    async def _call_gemini_debug(
        self,
        task_prompt: str,
        failing_cmd: str,
        stdout: str,
        stderr: str,
        attempt: int,
        modified_files: list[str],
        file_contents: dict[str, str]
    ) -> DebuggingFixPlan:
        # Structured classification using Gemini
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={self.gemini_key}"
        prompt = f"""
Analyze this validation failure in an autonomous engineering loop:
Task: {task_prompt}
Failing Command: {failing_cmd}
Stdout: {stdout[-2000:]}
Stderr: {stderr[-2000:]}
Modified Files: {modified_files}

Classify the failure and formulate a surgical fix plan.
Return ONLY valid JSON:
{{
  "attempt_number": {attempt},
  "classification": {{
    "category": "TEST_FAILURE",
    "summary": "...",
    "affected_files": [...],
    "root_cause": "...",
    "suggested_fix": "..."
  }},
  "files_to_edit": [...],
  "fix_description": "...",
  "actions": []
}}
"""
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)
            return DebuggingFixPlan(**parsed)

    def _heuristic_plan(self, task_prompt: str, repo_summary: dict, relevant_context: dict) -> ImplementationPlan:
        """
        Synthesizes an intelligent implementation plan based on repository structure & task tokens.
        """
        matched = relevant_context.get("matched_files", [])
        languages = repo_summary.get("languages", ["Python"])
        frameworks = repo_summary.get("frameworks", [])
        
        target_files_to_modify = []
        files_to_create = []
        
        # Determine candidate files to edit
        for f in matched:
            if not f.startswith("test") and "test" not in f:
                target_files_to_modify.append(f)
                break
                
        if not target_files_to_modify and matched:
            target_files_to_modify.append(matched[0])

        verification_commands = repo_summary.get("build_commands", [])
        if not verification_commands:
            if "Python" in languages:
                verification_commands = ["pytest -v"]
            elif "JavaScript" in languages or "TypeScript" in languages:
                verification_commands = ["npm test"]
            else:
                verification_commands = ["pytest -v"]

        summary = f"Plan to address '{task_prompt}' across {len(target_files_to_modify)} core file(s) with automated test verification."
        
        steps = [
            f"Analyze entry points and symbol hierarchy in {', '.join(target_files_to_modify) if target_files_to_modify else 'repository'}.",
            f"Implement changes requested for '{task_prompt}' preserving existing architecture.",
            f"Verify implementation using '{verification_commands[0] if verification_commands else 'automated suite'}'.",
            "Perform Git diff inspection and generate engineering summary."
        ]

        return ImplementationPlan(
            objective=task_prompt,
            summary=summary,
            files_to_inspect=matched[:4],
            files_to_modify=target_files_to_modify,
            files_to_create=files_to_create,
            dependencies=[],
            implementation_steps=steps,
            verification_commands=verification_commands,
            risks=["Ensure existing endpoint tests continue passing without regression."],
            requires_user_approval=False
        )

    def _heuristic_debug_fix(
        self,
        task_prompt: str,
        failing_cmd: str,
        stdout: str,
        stderr: str,
        attempt: int,
        modified_files: list[str],
        file_contents: dict[str, str]
    ) -> DebuggingFixPlan:
        combined_logs = (stdout + "\n" + stderr).lower()
        
        category = "TEST_FAILURE"
        root_cause = "Assertion or contract mismatch detected in test execution."
        if "syntaxerror" in combined_logs:
            category = "SYNTAX_ERROR"
            root_cause = "Syntax error in modified source file."
        elif "importerror" in combined_logs or "modulenotfounderror" in combined_logs:
            category = "IMPORT_ERROR"
            root_cause = "Missing or invalid module import."
        elif "typeerror" in combined_logs:
            category = "TYPE_ERROR"
            root_cause = "Incorrect argument type or mismatched function signature."

        classification = FailureClassification(
            category=category,
            summary=f"{category} encountered while executing '{failing_cmd}'.",
            affected_files=modified_files,
            root_cause=root_cause,
            suggested_fix="Adjust response model schema, route handler, and status code to align with test assertions."
        )

        return DebuggingFixPlan(
            attempt_number=attempt,
            classification=classification,
            files_to_edit=modified_files,
            fix_description="Applying targeted surgical fix to resolve error and satisfy test suite.",
            actions=[]
        )

llm_provider = LLMProvider()
