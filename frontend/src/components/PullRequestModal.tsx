"use client";

import React, { useState } from "react";
import { GitPullRequest, CheckCircle2, FileCode, X, ExternalLink } from "lucide-react";

interface PullRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, desc: string) => void;
  defaultTitle?: string;
  defaultDesc?: string;
  filesChangedCount?: number;
}

export const PullRequestModal: React.FC<PullRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultTitle = "feat: implement endpoint and automated tests",
  defaultDesc = "### Summary\n- Implemented requested application changes\n- All sandbox tests passed with zero regressions\n- Verified with CodeForge AI engineering loop",
  filesChangedCount = 1,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [desc, setDesc] = useState(defaultDesc);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(title, desc);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create Pull Request">
      <div className="modal-dialog">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)", background: "rgba(0, 229, 255, 0.12)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitPullRequest size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                Create Pull Request
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Publish verified changes to your remote repository.
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Status banner */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-secondary)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-success)" }}>
              <CheckCircle2 size={14} />
              <span>Validation: Tests & Build Passed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
              <FileCode size={13} />
              <span>{filesChangedCount} file(s) modified</span>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Pull Request Title
            </label>
            <input
              type="text"
              className="cf-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. feat: add health check endpoint"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              PR Description / Changelog
            </label>
            <textarea
              className="cf-input"
              style={{ height: "120px", resize: "none", fontFamily: "var(--font-mono)", fontSize: "12px" }}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>

        <div style={{ padding: "12px 20px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
            <GitPullRequest size={14} />
            <span>{isSubmitting ? "Drafting PR..." : "Create Pull Request"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
