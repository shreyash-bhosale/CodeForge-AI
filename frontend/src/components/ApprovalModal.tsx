"use client";

import React from "react";
import { ShieldAlert, FileText, Check, X, AlertTriangle } from "lucide-react";

interface ApprovalModalProps {
  isOpen: boolean;
  onApprove: () => void;
  onDeny: () => void;
  actionDetails: {
    title: string;
    filesToModify: string[];
    dependencies?: string[];
    risks?: string[];
  };
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onApprove,
  onDeny,
  actionDetails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Approval Required">
      <div className="modal-dialog">
        {/* Header */}
        <div style={{ padding: "16px 20px", background: "rgba(245, 158, 11, 0.08)", borderBottom: "1px solid rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", background: "rgba(245, 158, 11, 0.15)", color: "var(--color-warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              ACTION REQUIRES HUMAN APPROVAL
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              CodeForge AI policy requires confirmation before modifying repository files.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
              Planned Operation
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
              {actionDetails.title}
            </p>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
              Affected Files ({actionDetails.filesToModify.length})
            </div>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "8px 12px", maxHeight: "120px", overflowY: "auto", border: "1px solid var(--border-subtle)" }}>
              {actionDetails.filesToModify.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", padding: "2px 0" }}>
                  <FileText size={12} color="var(--accent-primary)" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {actionDetails.risks && actionDetails.risks.length > 0 && (
            <div style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f87171", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                <AlertTriangle size={13} />
                <span>Notice</span>
              </div>
              <ul style={{ paddingLeft: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                {actionDetails.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: "12px 20px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={onDeny}>
            <X size={14} />
            <span>Deny & Cancel</span>
          </button>
          <button className="btn btn-primary" onClick={onApprove}>
            <Check size={14} />
            <span>Approve & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
