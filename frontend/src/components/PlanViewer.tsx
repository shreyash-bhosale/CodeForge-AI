"use client";

import React from "react";
import { ListChecks, AlertTriangle, FileCode, CheckCircle, Terminal, ShieldAlert } from "lucide-react";

interface ImplementationPlanData {
  objective: string;
  summary: string;
  files_to_inspect: string[];
  files_to_modify: string[];
  files_to_create: string[];
  dependencies: string[];
  implementation_steps: string[];
  verification_commands: string[];
  risks: string[];
  requires_user_approval: boolean;
}

interface PlanViewerProps {
  plan: ImplementationPlanData | null;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({ plan }) => {
  if (!plan) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", background: "#0a0d14", color: "var(--text-muted)" }}>
        <ListChecks size={44} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
        <p style={{ fontSize: "0.9rem" }}>No implementation plan generated yet.</p>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
          Submit a task to trigger the Planning Agent.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px", background: "#0d1117" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header Banner */}
        <div style={{ padding: "16px 20px", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a5b4fc", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
            <ListChecks size={16} />
            <span>Implementation Strategy</span>
          </div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            {plan.objective}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {plan.summary}
          </p>
        </div>

        {/* Files targeted */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="glass-panel" style={{ padding: "14px" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <FileCode size={14} color="#818cf8" />
              <span>Target Files to Modify</span>
            </div>
            {plan.files_to_modify.length === 0 ? (
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>None</span>
            ) : (
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {plan.files_to_modify.map((f, i) => (
                  <li key={i} style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "#c7d2fe", background: "rgba(99, 102, 241, 0.12)", padding: "3px 8px", borderRadius: 4 }}>
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass-panel" style={{ padding: "14px" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Terminal size={14} color="#06b6d4" />
              <span>Verification Commands</span>
            </div>
            {plan.verification_commands.length === 0 ? (
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Automated test runner</span>
            ) : (
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {plan.verification_commands.map((cmd, i) => (
                  <li key={i} style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "#67e8f9", background: "rgba(6, 182, 212, 0.12)", padding: "3px 8px", borderRadius: 4 }}>
                    {cmd}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Step-by-Step Implementation Checklist */}
        <div className="glass-panel" style={{ padding: "16px" }}>
          <h3 style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
            Planned Engineering Steps
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {plan.implementation_steps.map((step, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.82rem" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.72rem", flexShrink: 0 }}>
                  {idx + 1}
                </span>
                <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        {plan.risks && plan.risks.length > 0 && (
          <div style={{ padding: "14px 16px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fcd34d", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6 }}>
              <ShieldAlert size={14} />
              <span>Identified Architectural Risks</span>
            </div>
            <ul style={{ paddingLeft: "18px", fontSize: "0.78rem", color: "#fde68a" }}>
              {plan.risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
