"use client";

import React from "react";
import Link from "next/link";
import { Cpu, GitBranch, Search, Moon, Sun, Bell, Terminal, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface AppTopBarProps {
  repoName?: string;
  branchName?: string;
  agentStatus?: string;
  onOpenCommandPalette: () => void;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  repoName = "Sample Microservice",
  branchName = "main",
  agentStatus = "IDLE",
  onOpenCommandPalette,
}) => {
  const { theme, toggleTheme } = useTheme();

  const getStatusBadge = () => {
    switch (agentStatus) {
      case "COMPLETED":
        return (
          <div className="pill pill-success" title="Verification Passed">
            <CheckCircle2 size={11} />
            <span>Verified</span>
          </div>
        );
      case "FAILED":
        return (
          <div className="pill pill-error" title="Validation Failed">
            <AlertCircle size={11} />
            <span>Attention</span>
          </div>
        );
      case "INITIAL":
      case "IDLE":
        return (
          <div className="pill pill-idle">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)" }}></span>
            <span>Idle</span>
          </div>
        );
      default:
        return (
          <div className="pill pill-active">
            <span className="pulse-indicator"></span>
            <span>{agentStatus}</span>
          </div>
        );
    }
  };

  return (
    <header
      style={{
        height: "48px",
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 100,
        userSelect: "none",
      }}
    >
      {/* Left: Brand & Breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <Link href="/app" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "var(--accent-primary)",
              color: "#08090b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--accent-glow)",
              fontWeight: 800,
            }}
          >
            <Cpu size={17} strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
            CodeForge<span style={{ color: "var(--accent-primary)" }}>AI</span>
          </span>
        </Link>

        <span style={{ color: "var(--border-strong)", fontSize: "14px" }}>/</span>

        {/* Repository breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{repoName}</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "var(--bg-secondary)",
              padding: "2px 8px",
              borderRadius: "var(--radius-xs)",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <GitBranch size={11} color="var(--accent-primary)" />
            <span>{branchName}</span>
          </div>
        </div>

        {/* Live Status Pill */}
        {getStatusBadge()}
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-sm)",
          padding: "5px 12px",
          color: "var(--text-muted)",
          fontSize: "12px",
          cursor: "pointer",
          width: "260px",
          justifyContent: "space-between",
          transition: "border-color var(--trans-fast)",
        }}
        aria-label="Open Command Palette"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Search size={13} />
          <span>Quick actions & commands...</span>
        </div>
        <kbd
          style={{
            background: "var(--bg-primary)",
            padding: "1px 5px",
            borderRadius: "3px",
            border: "1px solid var(--border-subtle)",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Right: Tools & Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          title="Sandbox Security Policy Active"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 8px",
            borderRadius: "var(--radius-xs)",
            background: "rgba(16, 185, 129, 0.08)",
            color: "var(--color-success)",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          <ShieldCheck size={13} />
          <span style={{ display: "inline" }}>SANDBOXED</span>
        </div>

        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
          title="Developer Account"
        >
          CF
        </div>
      </div>
    </header>
  );
};
