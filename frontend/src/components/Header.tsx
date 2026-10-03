"use client";

import React from "react";
import { Cpu, GitBranch, RotateCcw, Play, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface HeaderProps {
  status: string;
  activeBranch: string;
  repoName: string;
  onRollback: () => void;
  onReload: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeBranch,
  repoName,
  onRollback,
  onReload,
  isLoading,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "COMPLETED":
        return (
          <div className="status-pill success">
            <CheckCircle2 size={13} />
            <span>Ready / Verified</span>
          </div>
        );
      case "FAILED":
        return (
          <div className="status-pill error">
            <AlertCircle size={13} />
            <span>Attention Needed</span>
          </div>
        );
      case "INITIAL":
      case "IDLE":
        return (
          <div className="status-pill idle">
            <span className="pulse-dot" style={{ backgroundColor: "#94a3b8" }}></span>
            <span>Idle</span>
          </div>
        );
      default:
        return (
          <div className="status-pill active">
            <span className="pulse-dot" style={{ backgroundColor: "#6366f1" }}></span>
            <span>{status}...</span>
          </div>
        );
    }
  };

  return (
    <header className="app-header">
      <div className="brand-badge">
        <div className="brand-icon">
          <Cpu size={22} />
        </div>
        <div>
          <div className="brand-title">Codeforge AI</div>
          <div className="brand-tagline">Autonomous AI Coding Engineer</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Repo & Branch info */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Repository:</span>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{repoName || "Sample Service (FastAPI)"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-tertiary)", padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: "0.78rem" }}>
          <GitBranch size={13} color="var(--accent-indigo)" />
          <span style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>{activeBranch || "main"}</span>
        </div>

        {/* Live Status Pill */}
        {getStatusBadge()}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          className="btn-secondary"
          onClick={onReload}
          title="Refresh repository and files"
          disabled={isLoading}
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          <span>Sync</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onRollback}
          title="Revert repository back to clean snapshot"
          style={{ borderColor: "rgba(244, 63, 94, 0.2)" }}
        >
          <RotateCcw size={13} color="var(--accent-rose)" />
          <span>Rollback</span>
        </button>
      </div>
    </header>
  );
};
