"use client";

import React from "react";
import Link from "next/link";
import { Cpu, ArrowLeft, Home, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-canvas)", padding: "20px" }}>
      <div className="cf-card" style={{ maxWidth: "460px", padding: "36px", textAlign: "center", border: "1px solid var(--border-default)" }}>
        <div style={{ display: "inline-flex", padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--bg-active)", color: "var(--accent-primary)", marginBottom: "16px" }}>
          <Terminal size={32} />
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--color-error)", marginBottom: "8px" }}>
          ERROR 404: RESOURCE_NOT_FOUND
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
          Repository or Route Does Not Exist
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "24px" }}>
          The requested path was not located inside the active CodeForge AI workspace boundary.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link href="/app" className="btn btn-primary">
            <Home size={14} />
            <span>Return to Workspace</span>
          </Link>
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={14} />
            <span>Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
