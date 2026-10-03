# AI Coding Engineer — Product Requirements Document

> **Working Name:** Codeforge AI / AI Coding Engineer  
> **Product Type:** Agentic AI Software Engineering Platform  
> **Document Status:** ACTIVE / PLANNED  
> **Version:** 1.0  
> **Primary Goal:** Build an AI agent capable of understanding, modifying, testing, debugging, and improving real software repositories through an autonomous engineering loop.

---

# 1. Product Overview

## 1.1 One-Line Description

**AI Coding Engineer is an agentic software-development system that can inspect a real repository, understand its architecture, plan changes, modify code, execute tests and builds, debug failures, verify results, and generate Git-ready changes.**

## 1.2 Tagline

> **Understand. Plan. Code. Test. Debug. Ship.**

## 1.3 Product Vision

Traditional AI coding assistants primarily generate snippets or suggest code inside an editor.

AI Coding Engineer aims to operate one level higher.

Instead of responding only with generated code, it should understand the repository as a system and execute a complete software-engineering workflow:

```text
Understand
   ↓
Plan
   ↓
Implement
   ↓
Test
   ↓
Observe
   ↓
Reason
   ↓
Fix
   ↓
Retest
   ↓
Verify
   ↓
Generate Git Diff
```

The long-term goal is to create a small-scale autonomous software engineer capable of solving real GitHub issues safely inside controlled environments.

---

# 2. Problem Alignment & Value

## 2.1 Problem Statement

Software development often requires much more than writing code.

A developer handling a feature request must typically:

1. Understand an unfamiliar repository.
2. Locate relevant files.
3. Understand dependencies.
4. Identify architectural constraints.
5. Design an implementation.
6. Modify multiple files.
7. Install dependencies.
8. Run builds and tests.
9. Interpret errors.
10. Debug failures.
11. Verify behavior.
12. Review the resulting Git diff.
13. Document what changed.

Most AI coding tools help primarily with individual steps. AI Coding Engineer is intended to coordinate the entire workflow.

---

## 2.2 Target Users

### Primary
* Software engineering students
* AI/ML engineering students
* Hackathon developers
* Open-source contributors
* Individual developers
* Junior engineers working with unfamiliar repositories

### Secondary
* Engineering teams
* Maintainers reviewing GitHub issues
* Researchers evaluating coding agents
* Developer-tool builders

---

## 2.3 Current Alternatives

Users currently combine multiple tools manually:
* IDEs
* terminal commands
* Git
* GitHub
* AI chat assistants
* code-search tools
* test runners
* linters
* package managers
* debuggers

The workflow remains fragmented.

---

## 2.4 Proposed Solution

Provide one agentic workspace where a user can give a repository and a natural-language engineering request such as:

> Add Google authentication to my React + FastAPI application.

The system will:
1. Inspect the repository.
2. Detect languages and frameworks.
3. Build a structural model of the repository.
4. Search for authentication-related code.
5. Generate an implementation plan.
6. Request permission for sensitive actions where required.
7. Modify relevant files.
8. Run validation commands.
9. Analyze errors.
10. Attempt controlled fixes.
11. Re-run validation.
12. Produce the Git diff.
13. Summarize the implementation.

---

## 2.5 Problem Traceability

| Problem/Pain Point | Product Capability | User Outcome | Verification |
|---|---|---|---|
| Large repositories are difficult to understand | Repository Analyzer | Faster architecture understanding | Repository map generated |
| Finding relevant code is difficult | Semantic + structural search | Relevant files surfaced | Search evaluation |
| AI changes can lack planning | Planning Agent | Explicit implementation strategy | Plan generated before edits |
| Generated code often fails | Test/Build Runner | Errors detected automatically | Commands executed |
| Debugging is repetitive | Debugging Agent | Failures analyzed automatically | Error → fix trace |
| Autonomous edits can be risky | Permission/Sandbox System | Controlled execution | Restricted operations tested |
| AI changes are difficult to review | Git Diff Viewer | Transparent modifications | Diff produced |
| Agents may repeatedly fail | Retry limits + rollback | Repository protected | Failure-loop tests |
| Coding agents are hard to evaluate | Benchmark framework | Quantifiable performance | GitHub issue benchmark results |

---

# 3. Product Goals

## 3.1 Primary Goals

* **G-001 — Repository Understanding:** Generate a useful representation of an unfamiliar repository.
* **G-002 — Autonomous Implementation:** Transform natural-language requests into repository modifications.
* **G-003 — Engineering Verification:** Every implementation followed by tests, builds, linting, or static validation.
* **G-004 — Autonomous Debugging:** Failures trigger structured debugging rather than termination.
* **G-005 — Safe Execution:** Controlled environment execution for all commands and file operations.
* **G-006 — Transparent Reasoning Artifacts:** Plan, files inspected/changed, tool activity, validation results, Git diff, and final summary.
* **G-007 — Evaluation:** Evaluated against real software engineering tasks and GitHub issues.

---

# 4. Non-Goals

The first version will NOT attempt to:
* replace professional software engineers
* deploy arbitrary production changes automatically
* execute unrestricted shell commands
* modify external infrastructure without authorization
* merge directly into protected branches
* autonomously access production secrets
* perfectly understand every programming language
* solve every repository-level issue
* perform unlimited autonomous retries

---

# 5. Core User Stories (P0)

* **US-001:** Load repository for analysis.
* **US-002:** Describe coding task in natural language without manual file specification.
* **US-003:** Identify relevant files before editing to minimize unrelated changes.
* **US-004:** Produce implementation plan before code modification.
* **US-005:** Edit multiple repository files atomically and deterministically.
* **US-006:** Execute tests and builds after modification.
* **US-007:** Trigger autonomous debugging attempts on failed validation.
* **US-008:** Inspect Git diff before keeping changes.
* **US-009:** Sandboxed repository operations with policy enforcement.

---

# 6. High-Level Architecture & Agents

```mermaid
flowchart TD
    U[User] --> UI[Web Application (Next.js/React + Monaco + SSE)]
    UI --> API[FastAPI Backend]
    API --> ORCH[Agent Orchestrator]
    
    ORCH --> RA[Repository Analyzer]
    ORCH --> PA[Planning Agent]
    ORCH --> CA[Code Agent]
    ORCH --> EA[Execution Agent]
    ORCH --> DA[Debugging Agent]
    ORCH --> VA[Verification Agent]
    
    RA --> CI[Code Intelligence (Tree-sitter, AST, Search)]
    CA --> TOOLS[Repository Tools]
    EA --> SANDBOX[Docker / Policy Sandbox]
    SANDBOX --> TEST[Test & Build Runner]
    TOOLS --> GIT[Git Adapter]
    
    API --> DB[(PostgreSQL)]
    API --> REDIS[(Redis Task Queue)]
```

---

# 7. Agent Roles & Loop

1. **Repository Analyzer:** Generates repository tree, detects languages/frameworks, locates entry points, configs, test scripts.
2. **Planning Agent:** Analyzes objective, identifies candidate files, dependencies, creates steps and verification plan.
3. **Code Agent:** Reads files, applies surgical patches/creates files using structured tools.
4. **Execution Agent:** Runs deterministic commands (test, build, lint) in sandbox, captures exit code, stdout, stderr.
5. **Debugging Agent:** Classifies failure (`SYNTAX_ERROR`, `TEST_FAILURE`, `IMPORT_ERROR`, etc.), finds root cause, formulates fix plan.
6. **Verification Agent:** Validates request fulfillment, test pass, diff quality, generates summary report.

---

# 8. Sandbox & Security

* Command arrays (no raw shell string execution via `os.system`).
* Path traversal validation (chroot/canonical workspace boundary checking).
* Strict retry limits (`MAX_DEBUG_ATTEMPTS = 3`, `MAX_IMPLEMENTATION_ATTEMPTS = 1`).
* Secret redaction in logs and tool inputs/outputs.
* Exclusions: `.git`, `node_modules`, `venv`, `__pycache__`, `.env`.
