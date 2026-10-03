"use client";

import React, { useState } from "react";
import { Folder, FolderOpen, FileCode, FileText, ChevronRight, ChevronDown, Layers, Terminal } from "lucide-react";

export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: TreeNode[];
}

interface RepositoryExplorerProps {
  tree: TreeNode[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  analysis?: {
    languages: string[];
    frameworks: string[];
    build_commands: string[];
    architecture_summary: string;
  } | null;
}

const TreeItemRow: React.FC<{
  node: TreeNode;
  level: number;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}> = ({ node, level, selectedFile, onSelectFile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isDirectory = node.type === "directory";
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith(".py") || name.endsWith(".ts") || name.endsWith(".js") || name.endsWith(".tsx")) {
      return <FileCode size={14} color="#818cf8" />;
    }
    return <FileText size={14} color="#94a3b8" />;
  };

  return (
    <div>
      <div
        className={`tree-item ${isSelected ? "active" : ""}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {isDirectory ? (
          <>
            {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            {isOpen ? <FolderOpen size={14} color="#06b6d4" /> : <Folder size={14} color="#06b6d4" />}
          </>
        ) : (
          <>
            <span style={{ width: 13 }}></span>
            {getFileIcon(node.name)}
          </>
        )}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.name}
        </span>
      </div>

      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItemRow
              key={child.path}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const RepositoryExplorer: React.FC<RepositoryExplorerProps> = ({
  tree,
  selectedFile,
  onSelectFile,
  analysis,
}) => {
  return (
    <aside className="glass-panel explorer-panel">
      <div className="panel-header">
        <span>Repository Explorer</span>
        <Layers size={14} color="var(--accent-indigo)" />
      </div>

      {/* Architecture metadata banner */}
      {analysis && (
        <div style={{ padding: "10px 14px", background: "rgba(10, 13, 20, 0.4)", borderBottom: "1px solid var(--border-subtle)", fontSize: "0.74rem" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
            {analysis.languages.map((l) => (
              <span key={l} style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                {l}
              </span>
            ))}
            {analysis.frameworks.map((f) => (
              <span key={f} style={{ background: "rgba(6, 182, 212, 0.15)", color: "#67e8f9", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                {f}
              </span>
            ))}
          </div>
          {analysis.build_commands && analysis.build_commands.length > 0 && (
            <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <Terminal size={11} />
              <code style={{ fontSize: "0.72rem" }}>{analysis.build_commands[0]}</code>
            </div>
          )}
        </div>
      )}

      {/* Directory tree */}
      <div className="tree-container">
        {tree.length === 0 ? (
          <div style={{ padding: "20px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Loading repository files...
          </div>
        ) : (
          tree.map((node) => (
            <TreeItemRow
              key={node.path}
              node={node}
              level={0}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))
        )}
      </div>
    </aside>
  );
};
