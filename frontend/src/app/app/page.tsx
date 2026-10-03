"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCode,
  ShieldCheck,
  Plus,
  Play,
  Layers,
  Terminal,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

const API_BASE = "http://localhost:8000/api";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [repos, setRepos] = useState<any[]>([]);
  const [quickPrompt, setQuickPrompt] = useState("Add a /health endpoint returning application status");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/repositories`)
      .then((r) => r.json())
      .then((data) => {
        setRepos(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleLaunchTask = () => {
    if (!quickPrompt.trim()) return;
    router.push(`/app/repositories/active?task=${encodeURIComponent(quickPrompt)}`);
  };

  const recentRuns = [
    {
      id: "run-902",
      title: "Add a /health endpoint returning application status",
      repo: "FastAPI Benchmark Repository",
      status: "COMPLETED",
      testsPassed: "3/3",
      filesChanged: 1,
      duration: "4.2s",
      time: "10 mins ago",
    },
    {
      id: "run-901",
      title: "Fix deliberate assertion mismatch in test_app.py",
      repo: "FastAPI Benchmark Repository",
      status: "VERIFIED",
      testsPassed: "3/3",
      filesChanged: 1,
      duration: "6.8s",
      time: "1 hour ago",
    },
    {
      id: "run-899",
      title: "Implement user authentication dependency validator",
      repo: "FastAPI Benchmark Repository",
      status: "COMPLETED",
      testsPassed: "12/12",
      filesChanged: 3,
      duration: "18.4s",
      time: "Yesterday",
    },
  ];

  return (
    <div style={{ padding: "28px 36px", maxWidth: "1240px", margin: "0 auto" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
            Engineering Command Center
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Autonomous repository agent loop • Understand, Plan, Code, Test, Debug, Ship
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/app/repositories" className="btn btn-secondary">
            <FolderGit2 size={14} />
            <span>Manage Repositories</span>
          </Link>
          <Link href="/app/repositories/active" className="btn btn-primary">
            <Play size={14} />
            <span>Open Active Workspace</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "Active Repositories", value: repos.length || 1, hint: "1 sandboxed workspace" },
          { label: "Engineering Loop Success", value: "94.2%", hint: "Across test suites" },
          { label: "Mean Autonomous Retries", value: "1.2", hint: "Out of 3 max attempts" },
          { label: "Sandbox Security", value: "Active", hint: "Path traversal guarded" },
        ].map((m, i) => (
          <div key={i} className="cf-card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{m.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "4px 0" }}>
              {m.value}
            </div>
            <div style={{ fontSize: "11px", color: "var(--accent-primary)" }}>{m.hint}</div>
          </div>
        ))}
      </div>

      {/* Quick Task Launcher Card */}
      <div
        className="cf-panel"
        style={{
          padding: "24px",
          marginBottom: "28px",
          border: "1px solid var(--border-default)",
          background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--accent-primary)" }}>
          <Sparkles size={16} />
          <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Quick Launch Autonomous Task
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            className="cf-input"
            style={{ fontSize: "14px", padding: "10px 14px" }}
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            placeholder="e.g. Add a /health endpoint returning application status..."
          />
          <button className="btn btn-primary" onClick={handleLaunchTask} style={{ padding: "10px 20px" }}>
            <Play size={14} />
            <span>Launch Agent</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>Suggested:</span>
          {[
            "Add a /health endpoint returning application status",
            "Fix test assertion failures and verify suite",
            "Extract route symbols and create unit tests",
          ].map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuickPrompt(s)}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-pill)",
                padding: "3px 10px",
                fontSize: "11px",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Two Columns: Active Repositories + Recent Runs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        {/* Active Repository Card */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Active Repository</span>
            <Link href="/app/repositories" style={{ fontSize: "12px", color: "var(--accent-primary)" }}>
              View all
            </Link>
          </div>

          <div className="cf-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--bg-active)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FolderGit2 size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                    {repos[0]?.name || "FastAPI Benchmark Repository"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Branch: <code style={{ color: "var(--accent-primary)" }}>main</code> • Python 3.13
                  </div>
                </div>
              </div>
              <span className="pill pill-success">Sandboxed</span>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
              FastAPI microservice testbench equipped with pytest validation suite for autonomous endpoint creation and debugging verification.
            </p>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                FastAPI
              </span>
              <span style={{ fontSize: "11px", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                Pytest
              </span>
              <span style={{ fontSize: "11px", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                main.py
              </span>
            </div>

            <Link href="/app/repositories/active" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
              <span>Open in IDE Workspace</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Recent Runs History */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Recent Agent Executions</span>
            <Link href="/app/agents" style={{ fontSize: "12px", color: "var(--accent-primary)" }}>
              View all history
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentRuns.map((run) => (
              <div
                key={run.id}
                className="cf-card"
                style={{ padding: "14px 16px", cursor: "pointer" }}
                onClick={() => router.push("/app/repositories/active")}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {run.title}
                  </div>
                  <span className="pill pill-success">{run.status}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={12} color="var(--color-success)" />
                    Tests: {run.testsPassed}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <FileCode size={12} />
                    {run.filesChanged} file modified
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} />
                    {run.duration}
                  </span>
                  <span style={{ marginLeft: "auto" }}>{run.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
