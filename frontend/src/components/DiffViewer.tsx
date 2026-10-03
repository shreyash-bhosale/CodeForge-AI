"use client";

import React from "react";
import { GitCompare, Plus, Minus, Check, RotateCcw } from "lucide-react";

interface DiffViewerProps {
  diff: string;
  onRollback?: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diff, onRollback }) => {
  if (!diff || !diff.trim()) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", background: "#0a0d14", color: "var(--text-muted)" }}>
        <GitCompare size={44} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
        <p style={{ fontSize: "0.9rem" }}>No Git changes detected yet.</p>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
          Run an autonomous engineering task to generate modifications.
        </p>
      </div>
    );
  }

  const lines = diff.split("\n");
  const additions = lines.filter((l) => l.startsWith("+") && !l.startsWith("+++")).length;
  const deletions = lines.filter((l) => l.startsWith("-") && !l.startsWith("---")).length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0d1117" }}>
      {/* Diff stats toolbar */}
      <div style={{ padding: "8px 16px", background: "rgba(15, 20, 34, 0.9)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <GitCompare size={14} color="var(--accent-indigo)" />
            <span style={{ fontWeight: 600 }}>Git Working Tree Diff</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", fontFamily: "monospace" }}>
            <span style={{ color: "#3fb950", background: "rgba(46, 160, 67, 0.15)", padding: "2px 6px", borderRadius: 4 }}>
              +{additions} lines
            </span>
            <span style={{ color: "#f85149", background: "rgba(248, 81, 73, 0.15)", padding: "2px 6px", borderRadius: 4 }}>
              -{deletions} lines
            </span>
          </div>
        </div>

        {onRollback && (
          <button
            className="btn-secondary"
            onClick={onRollback}
            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
          >
            <RotateCcw size={12} color="var(--accent-rose)" />
            <span>Revert Changes</span>
          </button>
        )}
      </div>

      {/* Diff content lines */}
      <div className="diff-viewer">
        {lines.map((line, idx) => {
          let lineType = "context";
          if (line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("@@")) {
            lineType = "header";
          } else if (line.startsWith("+") && !line.startsWith("+++")) {
            lineType = "addition";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            lineType = "deletion";
          }

          return (
            <div key={idx} className={`diff-line ${lineType}`}>
              <span style={{ userSelect: "none", width: 35, color: "var(--text-muted)", opacity: 0.6, fontSize: "0.72rem" }}>
                {idx + 1}
              </span>
              <span>{line || " "}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
