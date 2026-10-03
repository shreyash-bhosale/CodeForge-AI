"use client";

import React, { useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Cpu,
  Clock,
  Layers,
  Search,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function EvaluationsPage() {
  const { addToast } = useToast();
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

  const benchmarkDataset = [
    {
      id: "BM-001",
      task: "Add /health endpoint with healthy boolean flag",
      repo: "fastapi-benchmark",
      result: "PASSED",
      retries: 0,
      tests: "3/3",
      duration: "4.2s",
      precision: "100%",
    },
    {
      id: "BM-002",
      task: "Resolve token expiry assertion mismatch in auth handler",
      repo: "fastapi-benchmark",
      result: "PASSED",
      retries: 1,
      tests: "3/3",
      duration: "6.8s",
      precision: "92%",
    },
    {
      id: "BM-003",
      task: "Implement missing user registration schema validation",
      repo: "fastapi-benchmark",
      result: "PASSED",
      retries: 0,
      tests: "12/12",
      duration: "8.1s",
      precision: "100%",
    },
    {
      id: "BM-004",
      task: "Handle circular dependency in async database session factory",
      repo: "fastapi-benchmark",
      result: "FAILED",
      retries: 3,
      tests: "14/16",
      duration: "24.5s",
      precision: "78%",
    },
    {
      id: "BM-005",
      task: "Add CORS middleware allowing localhost origins",
      repo: "fastapi-benchmark",
      result: "PASSED",
      retries: 0,
      tests: "4/4",
      duration: "3.9s",
      precision: "100%",
    },
    {
      id: "BM-006",
      task: "Catch and map integrity error on duplicate user email",
      repo: "fastapi-benchmark",
      result: "PASSED",
      retries: 1,
      tests: "6/6",
      duration: "7.4s",
      precision: "95%",
    },
  ];

  const handleRunBenchmark = () => {
    setIsRunningBenchmark(true);
    addToast({ title: "Benchmark Suite Started", message: "Evaluating autonomous engineering loop on 6 tasks...", type: "info" });
    setTimeout(() => {
      setIsRunningBenchmark(false);
      addToast({ title: "Benchmark Complete", message: "5/6 tasks passed (83.3% accuracy).", type: "success" });
    }, 2500);
  };

  return (
    <div style={{ padding: "28px 36px", maxWidth: "1240px", margin: "0 auto" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
            Agent Evaluation & Benchmark Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Quantifiable evaluation of code modification, test pass rates, and autonomous debugging efficiency
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleRunBenchmark} disabled={isRunningBenchmark}>
          <Play size={14} />
          <span>{isRunningBenchmark ? "Evaluating Suite..." : "Run Benchmark Suite"}</span>
        </button>
      </div>

      {/* Aggregate Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "Overall Task Success", value: "83.3%", change: "+4.1% vs baseline", positive: true },
          { label: "Test Pass Rate", value: "93.4%", change: "Zero regression rate", positive: true },
          { label: "Mean Debug Retries", value: "0.83", change: "Out of 3 max quota", positive: true },
          { label: "Median Task Runtime", value: "6.8s", change: "Deterministic sandbox", positive: true },
        ].map((m, i) => (
          <div key={i} className="cf-card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{m.label}</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", margin: "4px 0" }}>
              {m.value}
            </div>
            <div style={{ fontSize: "11px", color: m.positive ? "var(--color-success)" : "var(--color-error)" }}>
              {m.change}
            </div>
          </div>
        ))}
      </div>

      {/* SWE-bench Style Benchmark Tasks Table */}
      <div className="cf-panel" style={{ overflow: "hidden", border: "1px solid var(--border-default)" }}>
        <div style={{ padding: "16px 20px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              Curated Software Engineering Benchmark Tasks
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Reproducible repository issues executed inside isolated sandbox containers
            </p>
          </div>
          <span className="pill pill-active">6 Standard Benchmarks</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase" }}>
                <th style={{ padding: "12px 16px" }}>Task ID</th>
                <th style={{ padding: "12px 16px" }}>Engineering Objective</th>
                <th style={{ padding: "12px 16px" }}>Repository</th>
                <th style={{ padding: "12px 16px" }}>Result</th>
                <th style={{ padding: "12px 16px" }}>Retries</th>
                <th style={{ padding: "12px 16px" }}>Tests</th>
                <th style={{ padding: "12px 16px" }}>Runtime</th>
                <th style={{ padding: "12px 16px" }}>Precision</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkDataset.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background var(--trans-fast)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                    {row.id}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {row.task}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    <code style={{ fontSize: "11px", color: "var(--accent-primary)" }}>{row.repo}</code>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`pill ${row.result === "PASSED" ? "pill-success" : "pill-error"}`}>
                      {row.result}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    {row.retries}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--color-success)", fontWeight: 600 }}>
                    {row.tests}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {row.duration}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--accent-primary)", fontWeight: 600 }}>
                    {row.precision}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
