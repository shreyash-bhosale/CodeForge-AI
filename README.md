# CodeForge AI — Autonomous AI Coding Engineer

> **Understand. Plan. Code. Test. Debug. Ship.**

An agentic software-engineering platform capable of inspecting real software repositories, understanding cross-file architecture, planning changes, synthesizing verified code patches, executing sandboxed tests and builds, diagnosing and repairing failures in an autonomous debug loop, and shipping changes through Git and GitHub.

---

## ⚡ Autonomous Engineering Loop

```text
USER REQUEST
    ↓
REPOSITORY DISCOVERY & UNDERSTANDING (AST + Symbol Graph)
    ↓
CONTEXT RETRIEVAL (Hybrid Lexical + Symbol Graph)
    ↓
PLANNING AGENT (ImplementationPlan Schema & Risk Assessment)
    ↓
SERVER-SIDE HUMAN APPROVAL GATE (Safe Mode vs. Autonomous Mode)
    ↓
CODING AGENT (Structured Patch Generation & AST Validation)
    ↓
PATCH VALIDATION & ROLLBACK SNAPSHOT
    ↓
SANDBOX EXECUTION AGENT (Isolated Process / Ephemeral Container)
    ↓
TESTING & VALIDATION (Pytest / Jest / Build Commands)
    ↓
FAILURE OBSERVATION & CLASSIFICATION (Observe & Reason)
    ↓
DEBUGGING AGENT (Targeted Fixes & Retest Loop up to Max Retries)
    ↓
CODE REVIEW AGENT (Security, Style, Correctness)
    ↓
VERIFICATION AGENT (Git Diff Metrics & Engineering Report)
    ↓
GIT COMMIT & PULL REQUEST GENERATION
```

---

## 🛠️ Specialized Multi-Agent Architecture

1. **Repository Agent (`repository_agent.py` & `repository_graph.py`)**:
   - Inspects directory structure, builds recursive file trees, and extracts AST symbols.
   - Detects languages (`Python`, `TypeScript`, `JavaScript`, `Go`, `Rust`).
   - Identifies frameworks (`FastAPI`, `Next.js`, `Express`, `React`, `Flask`).
   - Constructs in-memory cross-file symbol and dependency graphs.

2. **Planning Agent (`planner_agent.py`)**:
   - Analyzes user prompt and retrieved repository context.
   - Outputs strict, validated `ImplementationPlan` JSON schema.
   - Identifies candidate files to modify/create and architectural risks.

3. **Coding Agent (`coding_agent.py`)**:
   - Calls multi-model LLM code generation (`generate_code_patch`).
   - Applies surgical patches (`PatchApplier`) with syntax verification (`PatchValidator`).
   - Maintains snapshot state (`PatchRollback`) for instantaneous error recovery.

4. **Execution Agent (`execution_agent.py`)**:
   - Executes deterministic validation commands with timeout protection.
   - Sanitizes command arguments and enforces security boundaries.

5. **Debugging Agent (`debugging_agent.py`)**:
   - Classifies failures (`TEST_FAILURE`, `SYNTAX_ERROR`, `IMPORT_ERROR`, `TYPE_ERROR`).
   - Formulates targeted repairs and re-runs the validation loop.

6. **Code Review Agent (`review_agent.py`)**:
   - Automated diff inspection checking for security vulnerabilities, wildcard imports, and style regressions.

7. **Verification Agent (`verification_agent.py`)**:
   - Compares working tree against baseline commit.
   - Computes line-by-line diff metrics (`+lines / -lines`).
   - Automatically commits changes to task branch (`agent/task-{id}`).

---

## 🔒 Security & Sandbox Guarantees

- **Path Traversal Protection**: Enforced chroot boundary checking on all file read/write operations (`validate_safe_path`).
- **Secret Protection**: `SecretScanner` and `SecretRedactor` detect and sanitize API keys, JWTs, AWS credentials, and database passwords before they reach LLM prompts or telemetry logs.
- **Credential Guard**: Prevents automated modification of protected config files (`.env`, `credentials.json`, `id_rsa`) without human authorization.
- **Prompt Injection Defense**: Repository source files and READMEs are tagged and isolated within `<UNTRUSTED_REPOSITORY_FILE>` boundaries to prevent indirect prompt injection.
- **Tool Permission Registry**: Every tool is classified with permissions (`READ_ONLY`, `SAFE_WRITE`, `EXECUTION`, `GIT`) and audited in the database (`tool_calls`).
- **Server-Side Approval Gate**: Orchestrator pauses at `AWAITING_APPROVAL` via asynchronous event when `auto_approve=False`.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Start the FastAPI Backend
```bash
./run_backend.sh
```
*Backend runs on `http://localhost:8000`*
*Interactive API Docs: `http://localhost:8000/docs`*

### 2. Start the Next.js Frontend
```bash
cd frontend
npm run dev
```
*Web Workspace runs on `http://localhost:3000`*

---

## 🧪 Automated Test Suite

Run the full backend automated test suite (17 comprehensive tests):

```bash
PYTHONPATH=backend backend/venv/bin/pytest backend/tests/ -v
```

Test coverage includes:
- **Authentication:** `backend/tests/test_auth.py`
- **Security & Sandboxing:** `backend/tests/test_security.py`
- **Patch Engine & Rollback:** `backend/tests/test_patch_engine.py`
- **Code Intelligence & AST:** `backend/tests/test_intelligence.py`
- **Multi-Agent Operations:** `backend/tests/test_agents.py`
- **Orchestrator Approval & Cancellation:** `backend/tests/test_orchestrator.py`
- **Evaluation Benchmark Engine:** `backend/tests/test_evaluations.py`

Run frontend validation:
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 📊 Live Evaluation & Benchmarks

CodeForge AI includes an autonomous evaluation benchmark engine (`backend/app/evaluations/engine.py`):
- Run benchmarks via UI (`/app/evaluations`) or API (`POST /api/evaluations/run`).
- Ephemeral sandboxes are provisioned for each test case against `backend/sample_repo`.
- Tracks resolution rate, average retries, duration, and regression rate in real time.
