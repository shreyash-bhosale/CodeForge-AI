"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  Terminal,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Folder,
  X,
} from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { useToast } from "@/context/ToastContext";

const API_BASE = "http://localhost:8000/api";

export default function RepositoriesPage() {
  const { addToast } = useToast();
  const [repos, setRepos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importType, setImportType] = useState<"sample" | "local" | "github">("sample");
  const [repoName, setRepoName] = useState("");
  const [sourcePath, setSourcePath] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRepos = async () => {
    try {
      const res = await fetch(`${API_BASE}/repositories`);
      const data = await res.json();
      setRepos(data);
    } catch (err) {
      console.error("Failed to load repositories:", err);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        name: repoName || (importType === "sample" ? "FastAPI Benchmark Repository" : "Custom Project"),
        source_type: importType,
      };

      if (importType === "local") payload.source_path = sourcePath;
      if (importType === "github") payload.remote_url = remoteUrl;

      const res = await fetch(`${API_BASE}/repositories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast({
          title: "Repository Connected",
          message: "Repository sandbox provisioned and analyzed.",
          type: "success",
        });
        setIsModalOpen(false);
        fetchRepos();
      } else {
        throw new Error("Failed to connect repository");
      }
    } catch (err: any) {
      addToast({
        title: "Connection Failed",
        message: err.message || "Could not initialize repository sandbox.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.source_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "28px 36px", maxWidth: "1240px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
            Connected Repositories
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Isolated development sandboxes with AST intelligence and test runners
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={14} />
          <span>Connect Repository</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <input
            type="text"
            className="cf-input"
            style={{ paddingLeft: "34px" }}
            placeholder="Search repositories by name or framework..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-muted)" }} />
        </div>
      </div>

      {/* Repositories Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
        {filtered.length === 0 ? (
          <div className="cf-card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 20px" }}>
            <FolderGit2 size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
              No repositories found
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", marginBottom: "16px" }}>
              Connect your first repository or load the built-in benchmark testbench.
            </p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={14} />
              <span>Connect Repository</span>
            </button>
          </div>
        ) : (
          filtered.map((r) => {
            const analysis = r.analysis || {};
            return (
              <div key={r.id} className="cf-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--bg-active)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FolderGit2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                          {r.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          Branch: <code style={{ color: "var(--accent-primary)" }}>{r.default_branch || "main"}</code>
                        </div>
                      </div>
                    </div>
                    <span className="pill pill-success">Sandboxed</span>
                  </div>

                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "14px" }}>
                    {analysis.architecture_summary || "Sandboxed repository with autonomous test execution."}
                  </p>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                    {analysis.languages?.map((l: string) => (
                      <span key={l} style={{ fontSize: "11px", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                        {l}
                      </span>
                    ))}
                    {analysis.frameworks?.map((f: string) => (
                      <span key={f} style={{ fontSize: "11px", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                        {f}
                      </span>
                    ))}
                    {analysis.test_frameworks?.map((t: string) => (
                      <span key={t} style={{ fontSize: "11px", background: "rgba(16, 185, 129, 0.08)", color: "var(--color-success)", padding: "2px 8px", borderRadius: "4px" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                  <Link href={`/app/repositories/${r.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                    <span>Open Workspace</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Connect Repository Modal */}
      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Connect Repository">
          <div className="modal-dialog">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FolderGit2 size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Connect Repository
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRepo}>
              {/* Type Switcher Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-secondary)" }}>
                {[
                  { key: "sample", label: "Sample Benchmark", icon: <CheckCircle2 size={13} /> },
                  { key: "local", label: "Local Directory", icon: <Folder size={13} /> },
                  { key: "github", label: "GitHub Repo", icon: <GithubIcon size={13} /> },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setImportType(t.key as any)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: importType === t.key ? 600 : 500,
                      color: importType === t.key ? "var(--accent-primary)" : "var(--text-muted)",
                      borderBottom: importType === t.key ? "2px solid var(--accent-primary)" : "none",
                      background: importType === t.key ? "var(--bg-primary)" : "transparent",
                    }}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Repository Display Name
                  </label>
                  <input
                    type="text"
                    className="cf-input"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder={importType === "sample" ? "FastAPI Benchmark Repository" : "my-awesome-project"}
                  />
                </div>

                {importType === "sample" && (
                  <div style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    Provisions an isolated FastAPI + Pytest testbench containing real models, routes, and assertions ready to test features and automated debugging loops.
                  </div>
                )}

                {importType === "local" && (
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                      Absolute Local Directory Path
                    </label>
                    <input
                      type="text"
                      className="cf-input"
                      value={sourcePath}
                      onChange={(e) => setSourcePath(e.target.value)}
                      placeholder="/Users/username/projects/my-api"
                      required
                    />
                  </div>
                )}

                {importType === "github" && (
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      className="cf-input"
                      value={remoteUrl}
                      onChange={(e) => setRemoteUrl(e.target.value)}
                      placeholder="https://github.com/owner/repository"
                      required
                    />
                  </div>
                )}
              </div>

              <div style={{ padding: "12px 20px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <span>{isSubmitting ? "Provisioning Sandbox..." : "Provision & Analyze"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
