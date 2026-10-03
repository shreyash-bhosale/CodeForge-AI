# Codeforge AI — Autonomous AI Coding Engineer

> **Understand. Plan. Code. Test. Debug. Ship.**

An agentic software-development system capable of inspecting real repositories, understanding architecture, planning changes, modifying code, executing sandboxed tests and builds, autonomously debugging failures, and generating Git-ready changes.

---

## ⚡ System Architecture

```text
┌─────────────────┐
│   UNDERSTAND    │ ➔ Repository Analyzer (Tree-sitter, AST, Framework Detection)
└────────┬────────┘
         ↓
┌─────────────────┐
│      PLAN       │ ➔ Planning Agent (ImplementationPlan schema, Risk Assessment)
└────────┬────────┘
         ↓
┌─────────────────┐
│    IMPLEMENT    │ ➔ Coding Agent (Surgical Patches, File Creation)
└────────┬────────┘
         ↓
┌─────────────────┐
│      TEST       │ ➔ Execution Agent (Sandboxed Pytest/NPM runner)
└────────┬────────┘
         ↓
┌─────────────────┐
│     OBSERVE     │ ➔ Captures exit codes, stdout, stderr
└────────┬────────┘
         ↓
┌─────────────────┐
│      REASON     │ ➔ Debugging Agent (Failure Classification & Root Cause)
└────────┬────────┘
         ↓
┌─────────────────┐
│       FIX       │ ➔ Targeted Repairs (Retry loop with max limits)
└────────┬────────┘
         ↓
┌─────────────────┐
│     VERIFY      │ ➔ Verification Agent (Git Diff, Status & Engineering Report)
└─────────────────┘
```

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
*The backend runs on [http://localhost:8000](http://localhost:8000)*
*API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)*

### 2. Start the Next.js Frontend
```bash
cd frontend
npm run dev
```
*The web workspace runs on [http://localhost:3000](http://localhost:3000)*

---

## 🛠️ Specialized Agents

1. **Repository Analyzer (`repository_agent.py`)**:
   - Inspects directory structure and builds recursive file trees.
   - Detects languages (`Python`, `TypeScript`, `JavaScript`, `Go`, `Rust`).
   - Identifies frameworks (`FastAPI`, `Flask`, `Next.js`, `React`, `Express`).
   - Discovers test commands (`pytest -v`, `npm test`) and entry points.

2. **Planning Agent (`planner_agent.py`)**:
   - Analyzes user prompt and retrieved repository context.
   - Outputs strict, validated `ImplementationPlan` JSON schema.
   - Identifies candidate files to modify/create and architectural risks.

3. **Coding Agent (`coding_agent.py`)**:
   - Applies surgical transformations and generates new files within workspace boundaries.

4. **Execution Agent (`execution_agent.py`)**:
   - Executes deterministic validation commands with timeout protection.
   - Prevents unsafe shell patterns (`rm -rf /`, fork bombs, etc.).

5. **Debugging Agent (`debugging_agent.py`)**:
   - Classifies failures (`TEST_FAILURE`, `SYNTAX_ERROR`, `IMPORT_ERROR`, `TYPE_ERROR`).
   - Formulates targeted repairs and re-runs the validation loop.

6. **Verification Agent (`verification_agent.py`)**:
   - Inspects working tree modifications.
   - Generates line-by-line Git diff metrics (`+lines / -lines`).
   - Prepares the final engineering summary report.

---

## 🖥️ Web Workspace Features

- **Monaco Code Editor**: Real-time syntax highlighting for Python, TypeScript, and JavaScript with line numbers and file breadcrumbs.
- **Git Diff Inspector**: Side-by-side view with addition (`+`) and deletion (`-`) statistics and one-click rollback.
- **Implementation Plan Viewer**: Step-by-step checklist, verification commands, and risk assessments.
- **Agent Activity & Telemetry**: Live Server-Sent Events (SSE) streaming with stage progress pills and terminal logs.

---

## 🔒 Security & Sandbox Guarantees

- **Path Traversal Protection**: Enforced chroot boundary checking on all file read/write operations.
- **Sanitized Execution**: Subprocess execution via command arrays rather than raw shell strings.
- **Strict Retry Quotas**: Hard-coded debug attempt limits (`MAX_DEBUG_ATTEMPTS = 3`) to prevent runaway loops.
