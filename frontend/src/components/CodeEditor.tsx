"use client";

import React from "react";
import dynamic from "next/dynamic";
import { FileCode, Loader2 } from "lucide-react";

// Dynamically import Monaco Editor to avoid SSR window issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", background: "#0e1320", color: "#94a3b8" }}>
      <Loader2 size={24} className="animate-spin" style={{ marginRight: 8 }} />
      <span>Loading Monaco Editor...</span>
    </div>
  ),
});

interface CodeEditorProps {
  filePath: string | null;
  code: string;
  onChange?: (val: string | undefined) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  filePath,
  code,
  onChange,
  readOnly = false,
}) => {
  const getLanguage = (path: string | null) => {
    if (!path) return "python";
    if (path.endsWith(".py")) return "python";
    if (path.endsWith(".js") || path.endsWith(".jsx")) return "javascript";
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".md")) return "markdown";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".css")) return "css";
    return "plaintext";
  };

  if (!filePath) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", background: "#0a0d14", color: "var(--text-muted)" }}>
        <FileCode size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
        <p style={{ fontSize: "0.9rem" }}>Select a file from the repository explorer</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0d1117" }}>
      <div style={{ padding: "8px 16px", background: "rgba(15, 20, 34, 0.9)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
        <FileCode size={14} color="#818cf8" />
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{filePath}</span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "auto" }}>
          {getLanguage(filePath).toUpperCase()}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={getLanguage(filePath)}
          theme="vs-dark"
          value={code}
          onChange={onChange}
          options={{
            readOnly: readOnly,
            minimap: { enabled: true },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "all",
          }}
        />
      </div>
    </div>
  );
};
