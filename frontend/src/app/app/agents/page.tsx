"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileCode,
  Search,
  Filter,
  ArrowRight,
  GitBranch,
  Terminal,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function AgentRunsPage() {
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "FAILED" | "RUNNING">("ALL");
  const [search, setSearch] = useState("");
  const [selectedRun, setSelectedRun] = useState<any | null>(null);

  const mockRuns = [
    {
      id: "run-902",
      title: "Add a /health endpoint returning application status",
      repository: "FastAPI Benchmark Repository",
      branch: "agent/task-30d4c10b",
      status: "COMPLETED",
      stage: "VERIFIED",
      testsPassed: 3,
      testsTotal: 3,
      filesModified: ["main.py"],
      linesAdded: 6,
      linesRemoved: 0,
      duration: "4.2s",
      retries: 0,
      createdAt: "10 minutes ago",
      plan: [
        "Analyze entry points and symbol hierarchy in main.py",
        "Implement @app.get('/health') endpoint",
        "Execute pytest -v in sandbox",
        "Verify 100% test pass rate",
      ],
      diff: "+@app.get('/health')\n+def health_check():\n+    return {'status': 'ok', 'healthy': True}",
    },
    {
      id: "run-901",
      title: "Fix deliberate assertion mismatch in test_app.py",
      repository: "FastAPI Benchmark Repository",
      branch: "agent/task-5849d622",
      status: "COMPLETED",
      stage: "REPAIR_LOOP",
      testsPassed: 3,
      testsTotal: 3,
      filesModified: ["main.py"],
      linesAdded: 4,
      linesRemoved: 1,
      duration: "6.8s",
      retries: 1,
      createdAt: "1 hour ago",
      plan: [
        "Detect test assertion failure",
        "Classify error: TEST_FAILURE",
        "Apply targeted response schema alignment",
        "Re-run verification test suite",
      ],
      diff: "-    return {'status': 'pending'}\n+    return {'status': 'ok', 'healthy': True}",
    },
    {
      id: "run-898",
      title: "Implement JWT token expiration validator",
      repository: "FastAPI Benchmark Repository",
      branch: "agent/task-8b1e4429",
      status: "COMPLETED",
      stage: "VERIFIED",
      testsPassed: 18,
      testsTotal: 18,
      filesModified: ["auth/token.py", "tests/test_auth.py"],
      linesAdded: 42,
      linesRemoved: 8,
      duration: "14.5s",
      retries: 0,
      createdAt: "Yesterday",
      plan: [
        "Inspect JWT cryptographic helper in auth/token.py",
        "Add exp claim validation with clock skew tolerance",
        "Create unit test suite for expired tokens",
        "Run automated pytest",
      ],
      diff: "+def verify_token_expiration(token: str):\n+    payload = jwt.decode(token, SECRET, algorithms=['HS256'])\n+    return payload",
    },
    {
      id: "run-895",
      title: "Refactor async database session connection pool",
      repository: "FastAPI Benchmark Repository",
      branch: "agent/task-11c90a12",
      status: "FAILED",
      stage: "MAX_RETRIES_EXCEEDED",
      testsPassed: 14,
      testsTotal: 16,
      filesModified: ["database.py"],
      linesAdded: 12,
      linesRemoved: 15,
      duration: "28.1s",
      retries: 3,
      createdAt: "2 days ago",
      plan: [
        "Update engine pool size and max overflow",
        "Verify async connection disposal",
      ],
      diff: "-engine = create_async_engine(URL, pool_size=5)\n+engine = create_async_engine(URL, pool_size=20, max_overflow=10)",
    },
  ];

  const filtered = mockRuns.filter((r) => {
    const matchesFilter = filter === "ALL" || r.status === filter;
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.repository.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: "28px 36px", maxWidth: "1240px", margin: "0 auto" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
            Agent Runs & Execution History
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Audit trail of autonomous engineering workflows, plans, tests, and diffs
          </p>
        </div>

        <Link href="/app/repositories/active" className="btn btn-primary">
          <Sparkles size={14} />
          <span>Launch New Run</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", gap: "16px" }}>
        <div style={{ display: "flex", background: "var(--bg-secondary)", padding: "2px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
          {(["ALL", "COMPLETED", "FAILED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-xs)",
                fontWeight: filter === tab ? 600 : 500,
                color: filter === tab ? "var(--text-primary)" : "var(--text-muted)",
                background: filter === tab ? "var(--bg-elevated)" : "transparent",
                transition: "all var(--trans-fast)",
              }}
            >
              {tab === "ALL" ? "All Runs" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", width: "320px" }}>
          <input
            type="text"
            className="cf-input"
            style={{ paddingLeft: "32px", fontSize: "12px" }}
            placeholder="Search runs by task or repository..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={13} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--text-muted)" }} />
        </div>
      </div>

      {/* Runs Table / Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((run) => (
          <div
            key={run.id}
            className="cf-card"
            style={{ padding: "18px 20px", cursor: "pointer" }}
            onClick={() => setSelectedRun(selectedRun?.id === run.id ? null : run)}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {run.title}
                  </span>
                  <span className={`pill ${run.status === "COMPLETED" ? "pill-success" : "pill-error"}`}>
                    {run.status}
                  </span>
                  {run.retries > 0 && (
                    <span className="pill pill-warning" style={{ fontSize: "10px" }}>
                      {run.retries} Repair Attempt{run.retries > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                  <span>{run.repository}</span>
                  <span>•</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>
                    <GitBranch size={12} />
                    {run.branch}
                  </span>
                  <span>•</span>
                  <span>{run.createdAt}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: "12px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-success)", fontWeight: 600 }}>
                    <CheckCircle2 size={13} />
                    <span>Tests {run.testsPassed}/{run.testsTotal}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Duration: {run.duration}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {run.filesModified.length} file{run.filesModified.length > 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: "11px", color: "#34d399", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                    +{run.linesAdded} / -{run.linesRemoved}
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Trace Drawer */}
            {selectedRun?.id === run.id && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Plan Steps */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                      Implementation Plan Executed
                    </div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                      {run.plan.map((step: string, i: number) => (
                        <li key={i} style={{ display: "flex", gap: "8px", color: "var(--text-secondary)" }}>
                          <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Git Diff Snippet */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                      Git Diff Produced
                    </div>
                    <pre style={{ background: "#05070a", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "#34d399", overflowX: "auto" }}>
                      {run.diff}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
