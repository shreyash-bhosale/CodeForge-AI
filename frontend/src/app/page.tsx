"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  ArrowRight,
  Sparkles,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  GitBranch,
  Layers,
  Bug,
  Code2,
  ListChecks,
  ChevronRight,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  const [activeLoopStage, setActiveLoopStage] = useState(0);

  const loopStages = [
    {
      title: "01 Understand",
      subtitle: "Repository Analyzer",
      description: "Inspects full codebase structure, AST symbols, entry points, package dependencies, and test scripts.",
      evidence: "FastAPI + Pytest detected • 14 files indexed • Symbols extracted",
      code: "analyzer.scan(repo_path)\n➔ Found: main.py, models.py, test_app.py\n➔ Language: Python (3.13) | Framework: FastAPI",
    },
    {
      title: "02 Plan",
      subtitle: "Planning Agent",
      description: "Generates explicit, Pydantic-validated implementation steps, candidate files, and risk assessments before editing.",
      evidence: "Plan JSON verified • 1 file to modify • Zero regression risk",
      code: '{\n  "objective": "Add /health endpoint",\n  "files_to_modify": ["main.py"],\n  "verification_commands": ["pytest -v"]\n}',
    },
    {
      title: "03 Implement",
      subtitle: "Coding Agent",
      description: "Executes surgical file modifications and creates new modules inside strict sandbox boundaries.",
      evidence: "main.py modified (+6 lines) • Convention preserved",
      code: '@app.get("/health")\ndef health_check():\n    return {"status": "ok", "healthy": True}',
    },
    {
      title: "04 Test",
      subtitle: "Execution Agent",
      description: "Runs deterministic test suites and builds in isolated environments with stdout, stderr, and exit code capture.",
      evidence: "Command: pytest -v • 3 test items collected",
      code: "$ pytest -v\ntest_app.py::test_root_endpoint PASSED [ 33%]\ntest_app.py::test_get_users PASSED     [ 66%]\ntest_app.py::test_health_check PASSED  [100%]",
    },
    {
      title: "05 Observe & Reason",
      subtitle: "Debugging Agent",
      description: "When tests or builds fail, classifies error categories (Syntax, Import, Assertion) and formulates root-cause repairs.",
      evidence: "Autonomous diagnosis • No manual stack trace parsing needed",
      code: "CLASSIFICATION: TEST_FAILURE\nROOT CAUSE: Missing status field in response JSON\nACTION: Applying schema alignment patch...",
    },
    {
      title: "06 Fix & Retest",
      subtitle: "Repair Loop",
      description: "Applies targeted patches and re-runs the test suite within strict retry limits to prevent runaway loops.",
      evidence: "Attempt 1/3 • Test suite re-executed • 100% Passed",
      code: "$ pytest -v (Retest)\n➔ 3 passed in 0.04s\n➔ Exit Code: 0 (SUCCESS)",
    },
    {
      title: "07 Verify & Ship",
      subtitle: "Verification Agent",
      description: "Computes final Git diff, generates engineering changelog, and creates ready-to-merge pull requests.",
      evidence: "Git branch created: agent/task-health • Clean diff",
      code: "diff --git a/main.py b/main.py\n+@app.get(\"/health\")\n+def health_check():\n+    return {\"status\": \"ok\", \"healthy\": True}",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-canvas)", color: "var(--text-primary)" }}>
      {/* Top Navigation */}
      <nav
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(8, 9, 11, 0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-sm)",
              background: "var(--accent-primary)",
              color: "#08090b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            <Cpu size={19} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            CodeForge<span style={{ color: "var(--accent-primary)" }}>AI</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "13px" }}>
          <a href="#how-it-works" style={{ color: "var(--text-secondary)" }}>
            How It Works
          </a>
          <a href="#comparison" style={{ color: "var(--text-secondary)" }}>
            Traditional vs AI
          </a>
          <a href="#capabilities" style={{ color: "var(--text-secondary)" }}>
            Capabilities
          </a>
          <a href="#security" style={{ color: "var(--text-secondary)" }}>
            Security
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/login" className="btn btn-ghost">
            Sign In
          </Link>
          <Link href="/app" className="btn btn-primary">
            <span>Open Workspace</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: "80px 24px 60px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0, 229, 255, 0.08)",
            border: "1px solid rgba(0, 229, 255, 0.25)",
            padding: "4px 14px",
            borderRadius: "var(--radius-pill)",
            fontSize: "12px",
            color: "var(--accent-primary)",
            marginBottom: "24px",
          }}
        >
          <Sparkles size={14} />
          <span>AUTONOMOUS ENGINEERING SYSTEM</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 60px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: "900px",
            margin: "0 auto 20px",
            background: "linear-gradient(180deg, #FFFFFF 30%, #A4ACB9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Your Autonomous AI Software Engineer.
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "var(--text-secondary)",
            maxWidth: "700px",
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          Understand repositories. Plan architectural changes. Write code. Execute sandboxed tests. Debug failures. Ship verified pull requests.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "60px" }}>
          <Link href="/app" className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "15px" }}>
            <span>Start Building</span>
            <ArrowRight size={16} />
          </Link>
          <a href="#how-it-works" className="btn btn-secondary" style={{ padding: "12px 24px", fontSize: "15px" }}>
            <span>View How It Works</span>
          </a>
        </div>

        {/* Live Interactive Engineering Loop Workspace Preview */}
        <div
          id="how-it-works"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            textAlign: "left",
          }}
        >
          {/* Header of preview */}
          <div
            style={{
              padding: "12px 20px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px", fontFamily: "var(--font-mono)" }}>
                codeforge-agent-loop // live telemetry
              </span>
            </div>
            <div className="pill pill-active">
              <span className="pulse-indicator"></span>
              <span>Autonomous Loop Active</span>
            </div>
          </div>

          {/* Interactive Steps Bar */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-canvas)",
              overflowX: "auto",
            }}
          >
            {loopStages.map((st, i) => (
              <button
                key={i}
                onClick={() => setActiveLoopStage(i)}
                style={{
                  padding: "12px 18px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: activeLoopStage === i ? "var(--accent-primary)" : "var(--text-muted)",
                  borderBottom: activeLoopStage === i ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  background: activeLoopStage === i ? "var(--bg-primary)" : "transparent",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all var(--trans-fast)",
                }}
              >
                {st.title}
              </button>
            ))}
          </div>

          {/* Body of preview */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "300px" }}>
            <div style={{ padding: "28px", borderRight: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                {loopStages[activeLoopStage].subtitle}
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "var(--text-primary)" }}>
                {loopStages[activeLoopStage].title.replace(/^\d+\s/, "")}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
                {loopStages[activeLoopStage].description}
              </p>
              <div style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--color-success)", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={15} />
                <span>{loopStages[activeLoopStage].evidence}</span>
              </div>
            </div>

            <div style={{ background: "#06080b", padding: "24px", overflowX: "auto", fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: 1.6, color: "#a5b4fc" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "11px", marginBottom: "10px", userSelect: "none" }}>
                // AGENT TELEMETRY ARTIFACT
              </div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {loopStages[activeLoopStage].code}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Traditional Fragmented Workflow vs CodeForge AI */}
      <section id="comparison" style={{ padding: "80px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
            Fragmented Coding Assistants vs Full Engineering Loop
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Why simple text completions are not enough for real software engineering.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Traditional */}
          <div className="cf-card" style={{ padding: "28px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <div style={{ fontSize: "13px", color: "#f87171", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              Traditional Fragmented Workflow
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "var(--text-muted)" }}>
              <li style={{ display: "flex", gap: "8px" }}>✕ Manually search and comprehend unfamiliar repository</li>
              <li style={{ display: "flex", gap: "8px" }}>✕ AI generates code snippet with no repository awareness</li>
              <li style={{ display: "flex", gap: "8px" }}>✕ Developer manually pastes code into multiple files</li>
              <li style={{ display: "flex", gap: "8px" }}>✕ Run terminal builds and test suites manually</li>
              <li style={{ display: "flex", gap: "8px" }}>✕ Decode stack traces and re-prompt the LLM</li>
              <li style={{ display: "flex", gap: "8px" }}>✕ Manually format Git diffs and pull requests</li>
            </ul>
          </div>

          {/* CodeForge AI */}
          <div className="cf-card" style={{ padding: "28px", border: "1px solid var(--accent-border)", background: "rgba(0, 229, 255, 0.03)" }}>
            <div style={{ fontSize: "13px", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              CodeForge AI Unified Loop
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "var(--text-primary)" }}>
              <li style={{ display: "flex", gap: "8px" }}>✓ Autonomous AST and symbol understanding across all files</li>
              <li style={{ display: "flex", gap: "8px" }}>✓ Explicit implementation plan generated before any edits</li>
              <li style={{ display: "flex", gap: "8px" }}>✓ Surgical atomic modifications applied in sandboxed workspace</li>
              <li style={{ display: "flex", gap: "8px" }}>✓ Deterministic test and build execution via sandbox runners</li>
              <li style={{ display: "flex", gap: "8px" }}>✓ Autonomous failure reasoning and targeted repairs</li>
              <li style={{ display: "flex", gap: "8px" }}>✓ Verified Git diff and 1-click pull request generation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Capabilities Matrix */}
      <section id="capabilities" style={{ padding: "60px 24px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
            Engineered for Real Codebases
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Built with production safety, transparent execution, and developer control.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {[
            {
              icon: <Layers size={20} color="var(--accent-primary)" />,
              title: "Repository Intelligence",
              desc: "Deep AST parsing, framework detection, and symbol mapping across Python, JavaScript, and TypeScript.",
            },
            {
              icon: <ListChecks size={20} color="#818cf8" />,
              title: "Explicit Planning Agent",
              desc: "Formulates verified implementation plans with candidate files and architectural risks before modifying code.",
            },
            {
              icon: <Terminal size={20} color="#10b981" />,
              title: "Sandboxed Test Runner",
              desc: "Executes test suites and builds safely within isolated boundaries with real-time stdout and exit code capture.",
            },
            {
              icon: <Bug size={20} color="#f59e0b" />,
              title: "Autonomous Debugging",
              desc: "Classifies failures, extracts root causes from traces, applies surgical repairs, and re-tests automatically.",
            },
            {
              icon: <GitBranch size={20} color="#06b6d4" />,
              title: "Git Workflow & Diff",
              desc: "Automatic task branch creation, line-by-line diff inspection, and 1-click rollback to clean snapshots.",
            },
            {
              icon: <ShieldCheck size={20} color="#34d399" />,
              title: "Permission & Safety Quotas",
              desc: "Path traversal guards, blocked shell commands, secret redaction, and strict 3-attempt debug retry limits.",
            },
          ].map((cap, i) => (
            <div key={i} className="cf-card">
              <div style={{ marginBottom: "12px" }}>{cap.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                {cap.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Architecture */}
      <section id="security" style={{ padding: "60px 24px 80px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Lock size={22} color="var(--accent-primary)" />
            <h2 style={{ fontSize: "22px", fontWeight: 700 }}>Security Architecture & Isolation</h2>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
            Autonomous agents must never have unrestricted access to your machine or production credentials. CodeForge AI implements enterprise-grade boundaries:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Path Traversal Defense</strong>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Strict chroot workspace validation blocks directory escaping.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Sanitized Command Arrays</strong>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Raw shell string execution is disabled; blocked patterns trigger errors.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Secret Protection</strong>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>.env contents are excluded from ordinary context and logs are redacted.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Safe Rollback</strong>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Working trees are snapshotted prior to execution for 1-click restore.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: "60px 24px 100px", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "16px" }}>
          Give CodeForge AI a repository.
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto 32px" }}>
          Experience the autonomous engineering loop on your codebase today.
        </p>
        <Link href="/app" className="btn btn-primary" style={{ padding: "14px 36px", fontSize: "16px" }}>
          <span>Launch CodeForge AI Workspace</span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
