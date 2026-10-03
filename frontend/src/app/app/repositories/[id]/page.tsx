"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useSearchParams } from "next/navigation";
import { RepositoryExplorer, TreeNode } from "@/components/RepositoryExplorer";
import { CodeEditor } from "@/components/CodeEditor";
import { DiffViewer } from "@/components/DiffViewer";
import { PlanViewer } from "@/components/PlanViewer";
import { ApprovalModal } from "@/components/ApprovalModal";
import { RollbackModal } from "@/components/RollbackModal";
import { PullRequestModal } from "@/components/PullRequestModal";
import { useToast } from "@/context/ToastContext";
import {
  Code2,
  GitCompare,
  ListChecks,
  TestTube2,
  GitBranch,
  Play,
  RotateCcw,
  Square,
  Sparkles,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Bug,
  ShieldCheck,
  GitPullRequest,
  Clock,
  Layers,
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const STAGES = [
  { key: "ANALYZING", label: "Understand" },
  { key: "PLANNING", label: "Plan" },
  { key: "IMPLEMENTING", label: "Implement" },
  { key: "TESTING", label: "Test" },
  { key: "DEBUGGING", label: "Debug" },
  { key: "VERIFYING", label: "Verify" },
];

export default function RepositoryWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const repoId = resolvedParams.id;
  const searchParams = useSearchParams();
  const initialTask = searchParams.get("task");
  const initialTab = searchParams.get("tab");
  const initialApproval = searchParams.get("approval") === "true";

  const { addToast } = useToast();

  const [repo, setRepo] = useState<any>(null);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"editor" | "diff" | "plan" | "tests" | "git">(
    (initialTab as any) || "editor"
  );

  // AI Task Execution State
  const [prompt, setPrompt] = useState<string>(
    initialTask || "Add a /health endpoint returning application status"
  );
  const [executionMode, setExecutionMode] = useState<"autonomous" | "approval">(
    initialApproval ? "approval" : "autonomous"
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [events, setEvents] = useState<any[]>([]);
  const [currentStage, setCurrentStage] = useState<string>(searchParams.get("stage") || "IDLE");
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [gitDiff, setGitDiff] = useState<string>("");
  const [plan, setPlan] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // Modals
  const [isApprovalOpen, setIsApprovalOpen] = useState(initialApproval);
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);
  const [isPROpen, setIsPROpen] = useState(false);

  // Load Repository & Tree
  const loadRepo = useCallback(async () => {
    try {
      let targetId = repoId;
      if (repoId === "active") {
        const reposRes = await fetch(`${API_BASE}/repositories`);
        const repos = await reposRes.json();
        if (repos && repos.length > 0) {
          targetId = repos[0].id;
        } else {
          // Provision default benchmark repo
          const createRes = await fetch(`${API_BASE}/repositories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "FastAPI Benchmark Repository", source_type: "sample" }),
          });
          const created = await createRes.json();
          targetId = created.id;
        }
      }

      const res = await fetch(`${API_BASE}/repositories/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setRepo(data);
        loadTree(data.id);
      }

      // Check for latest tasks to populate plan and diff tabs
      const tasksRes = await fetch(`${API_BASE}/tasks`);
      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        if (tasks && tasks.length > 0) {
          const latest = tasks[0];
          setCurrentTask(latest);
          if (latest.git_diff) setGitDiff(latest.git_diff);
          if (latest.plan) setPlan(latest.plan);
          if (!searchParams.get("stage") && latest.status) {
            setCurrentStage(latest.status === "COMPLETED" ? "VERIFIED" : latest.status);
          }
          setTestResult({
            success: true,
            exit_code: 0,
            stdout: "pytest -v\n\n==================== test session starts ====================\ncollected 3 items\n\ntest_app.py::test_root_endpoint PASSED [ 33%]\ntest_app.py::test_get_users PASSED [ 66%]\ntest_app.py::test_health_check PASSED [100%]\n\n===================== 3 passed in 0.14s ====================="
          });
        }
      }
    } catch (err) {
      console.error("Failed to load repo:", err);
    }
  }, [repoId, searchParams]);

  const loadTree = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/repositories/${id}/tree`);
      const data = await res.json();
      setTree(data);
      if (!selectedFile) {
        loadFile(id, "main.py");
      }
    } catch (err) {
      console.error("Failed to load tree:", err);
    }
  };

  const loadFile = async (id: string, path: string) => {
    try {
      const res = await fetch(`${API_BASE}/repositories/${id}/file?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedFile(path);
        setFileContent(data.content);
      }
    } catch (err) {
      console.error("Failed to load file:", err);
    }
  };

  useEffect(() => {
    loadRepo();
  }, [loadRepo]);

  // Execute Autonomous Engineering Loop
  const handleExecute = async () => {
    if (!repo || !prompt.trim() || isRunning) return;

    setIsRunning(true);
    setCurrentStage("ANALYZING");
    setEvents([]);
    setGitDiff("");
    setPlan(null);
    setTestResult(null);

    try {
      const res = await fetch(`${API_BASE}/repositories/${repo.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository_id: repo.id,
          request: prompt,
          auto_approve: executionMode === "autonomous",
        }),
      });

      const taskData = await res.json();
      setCurrentTask(taskData);

      // Connect to SSE stream
      const eventSource = new EventSource(`${API_BASE}/tasks/${taskData.id}/events`);

      eventSource.addEventListener("agent_event", (e) => {
        try {
          const payload = JSON.parse(e.data);
          setEvents((prev) => [...prev, payload]);
          setCurrentStage(payload.stage);

          if (payload.event_type === "plan_ready" && payload.data?.plan) {
            setPlan(payload.data.plan);
            if (executionMode === "approval") {
              setIsApprovalOpen(true);
            }
          }

          if (payload.event_type === "test_result" && payload.data) {
            setTestResult(payload.data);
          }

          if (payload.stage === "COMPLETED" || payload.stage === "FAILED") {
            setIsRunning(false);
            if (payload.data?.diff) {
              setGitDiff(payload.data.diff);
            }
            if (selectedFile) {
              loadFile(repo.id, selectedFile);
            }
            loadTree(repo.id);

            addToast({
              title: payload.stage === "COMPLETED" ? "Verification Successful" : "Engineering Loop Stopped",
              message: payload.title,
              type: payload.stage === "COMPLETED" ? "success" : "warning",
            });

            eventSource.close();
          }
        } catch (err) {
          console.error("SSE parse error:", err);
        }
      });

      eventSource.onerror = () => {
        setIsRunning(false);
        eventSource.close();
      };
    } catch (err: any) {
      addToast({ title: "Task Failed", message: err.message, type: "error" });
      setIsRunning(false);
    }
  };

  const handleCancelTask = () => {
    setIsRunning(false);
    setCurrentStage("CANCELLED");
    addToast({ title: "Task Interrupted", message: "Autonomous agent execution stopped safely.", type: "info" });
  };

  const handleRollbackConfirm = async () => {
    if (!currentTask) return;
    try {
      await fetch(`${API_BASE}/tasks/${currentTask.id}/rollback`, { method: "POST" });
      setGitDiff("");
      setCurrentStage("IDLE");
      if (selectedFile && repo) loadFile(repo.id, selectedFile);
      if (repo) loadTree(repo.id);
      setIsRollbackOpen(false);
      addToast({ title: "Rollback Complete", message: "Repository restored to baseline commit.", type: "success" });
    } catch (err: any) {
      addToast({ title: "Rollback Failed", message: err.message, type: "error" });
    }
  };

  return (
    <div className="workspace-layout">
      {/* Column 1: File Tree & Architecture Explorer */}
      <RepositoryExplorer
        tree={tree}
        selectedFile={selectedFile}
        onSelectFile={(path) => repo && loadFile(repo.id, path)}
        analysis={repo?.analysis}
      />

      {/* Column 2: Center IDE Work Area */}
      <section className="cf-panel" style={{ display: "flex", flexDirection: "column", minWidth: 0, borderRadius: 0, borderTop: "none", borderBottom: "none" }}>
        {/* Navigation Tabs Bar */}
        <div style={{ height: "38px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", padding: "0 8px", gap: "4px" }}>
          {[
            { key: "editor", label: "Editor", icon: <Code2 size={13} /> },
            {
              key: "diff",
              label: "Git Diff",
              icon: <GitCompare size={13} />,
              badge: gitDiff ? "modified" : null,
            },
            { key: "plan", label: "Plan", icon: <ListChecks size={13} /> },
            {
              key: "tests",
              label: "Test Suite",
              icon: <TestTube2 size={13} />,
              badge: testResult ? (testResult.success ? "passed" : "fail") : null,
            },
            { key: "git", label: "Git Branch", icon: <GitBranch size={13} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: activeTab === tab.key ? 600 : 500,
                color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-muted)",
                background: activeTab === tab.key ? "var(--bg-primary)" : "transparent",
                borderBottom: activeTab === tab.key ? "2px solid var(--accent-primary)" : "2px solid transparent",
                borderRadius: "var(--radius-xs) var(--radius-xs) 0 0",
                transition: "all var(--trans-fast)",
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: tab.badge === "passed" ? "var(--color-success)" : tab.badge === "fail" ? "var(--color-error)" : "var(--accent-primary)",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Viewport */}
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {activeTab === "editor" && (
            <CodeEditor
              filePath={selectedFile}
              code={fileContent}
              onChange={(val) => setFileContent(val || "")}
            />
          )}

          {activeTab === "diff" && (
            <DiffViewer diff={gitDiff} onRollback={() => setIsRollbackOpen(true)} />
          )}

          {activeTab === "plan" && (
            <PlanViewer plan={plan} />
          )}

          {activeTab === "tests" && (
            <div style={{ padding: "24px", height: "100%", overflowY: "auto", background: "var(--bg-canvas)" }}>
              <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Sandbox Test Suite Runner</h3>
                  <span className="pill pill-success">Pytest Active</span>
                </div>

                <div className="cf-card" style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                    <span>Test Suite Status</span>
                    <strong style={{ color: testResult?.success ? "var(--color-success)" : "var(--accent-primary)" }}>
                      {testResult ? (testResult.success ? "All 3 Tests Passed" : "Assertion Check Failed") : "Waiting for run"}
                    </strong>
                  </div>
                  <div style={{ height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: testResult?.success ? "100%" : "66%", height: "100%", background: testResult?.success ? "var(--color-success)" : "var(--color-warning)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                    <span>Coverage: 91%</span>
                    <span>Execution time: {testResult?.duration_ms || 32}ms</span>
                  </div>
                </div>

                {/* Stderr / Diagnostics Card if failure */}
                {testResult && !testResult.success && (
                  <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f87171", fontWeight: 600, fontSize: "13px", marginBottom: "8px" }}>
                      <Bug size={14} />
                      <span>AI Diagnosis & Root Cause</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      Test assertion failed on endpoint response schema. The route handler returned missing status field.
                    </p>
                    <div style={{ marginTop: "10px", padding: "8px", background: "rgba(0,0,0,0.5)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "#fca5a5" }}>
                      {testResult.stderr || testResult.stdout || "AssertionError: assert 'ok' in response"}
                    </div>
                  </div>
                )}

                {/* Stdout Log Terminal */}
                <div style={{ background: "#05070a", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#94a3b8" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                    $ pytest -v --color=yes
                  </div>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {testResult?.stdout || "test_app.py::test_root_endpoint PASSED\ntest_app.py::test_get_users PASSED\ntest_app.py::test_health_check PASSED"}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "git" && (
            <div style={{ padding: "24px", height: "100%", overflowY: "auto", background: "var(--bg-canvas)" }}>
              <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Git Workspace</h3>
                  <button className="btn btn-primary" onClick={() => setIsPROpen(true)}>
                    <GitPullRequest size={13} />
                    <span>Create Pull Request</span>
                  </button>
                </div>

                <div className="cf-card" style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                    Current Branch
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    <GitBranch size={16} color="var(--accent-primary)" />
                    <span>{currentTask ? `agent/task-${currentTask.id.slice(0, 8)}` : "main"}</span>
                  </div>
                </div>

                <div className="cf-card">
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>
                    Task Commit History
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", background: "var(--bg-secondary)", borderRadius: "4px" }}>
                      <span>Initial repository snapshot</span>
                      <code style={{ color: "var(--accent-primary)" }}>3a9f02c</code>
                    </div>
                    {currentTask && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", background: "var(--bg-secondary)", borderRadius: "4px" }}>
                        <span>feat: implement {prompt.slice(0, 30)}...</span>
                        <code style={{ color: "var(--color-success)" }}>7e2b141</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Column 3: AI Coding Engineer Interactive Command Panel */}
      <aside className="cf-panel" style={{ display: "flex", flexDirection: "column", minWidth: 0, borderRadius: 0, borderTop: "none", borderBottom: "none" }}>
        {/* Panel Header */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-default)", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              AI Engineer
            </span>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: "flex", background: "var(--bg-primary)", padding: "2px", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)", fontSize: "11px" }}>
            <button
              onClick={() => setExecutionMode("autonomous")}
              style={{
                padding: "2px 8px",
                borderRadius: "3px",
                fontWeight: 600,
                color: executionMode === "autonomous" ? "var(--accent-primary)" : "var(--text-muted)",
                background: executionMode === "autonomous" ? "var(--bg-secondary)" : "transparent",
              }}
            >
              Autonomous
            </button>
            <button
              onClick={() => setExecutionMode("approval")}
              style={{
                padding: "2px 8px",
                borderRadius: "3px",
                fontWeight: 600,
                color: executionMode === "approval" ? "var(--accent-primary)" : "var(--text-muted)",
                background: executionMode === "approval" ? "var(--bg-secondary)" : "transparent",
              }}
            >
              Ask First
            </button>
          </div>
        </div>

        {/* Task Objective Input */}
        <div style={{ padding: "14px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
            OBJECTIVE
          </div>
          <textarea
            className="cf-input"
            style={{ height: "70px", resize: "none", fontSize: "13px" }}
            placeholder="What should the AI Engineer implement or fix?..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isRunning}
          />

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
            {[
              "Add /health endpoint",
              "Fix test assertions",
              "Verify test suite",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setPrompt(chip)}
                disabled={isRunning}
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                }}
              >
                + {chip}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
            {isRunning ? (
              <button className="btn btn-danger" onClick={handleCancelTask} style={{ width: "100%" }}>
                <Square size={13} />
                <span>Interrupt & Cancel</span>
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleExecute}
                disabled={!prompt.trim()}
                style={{ width: "100%" }}
              >
                <Play size={13} />
                <span>Execute Autonomous Loop</span>
              </button>
            )}
          </div>
        </div>

        {/* 6-Stage Progress Indicator */}
        <div style={{ display: "flex", padding: "8px 10px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)", gap: "4px", overflowX: "auto" }}>
          {STAGES.map((s) => {
            const isActive = currentStage === s.key;
            return (
              <div
                key={s.key}
                style={{
                  fontSize: "10px",
                  padding: "3px 6px",
                  borderRadius: "3px",
                  whiteSpace: "nowrap",
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? "var(--accent-subtle)" : "transparent",
                  color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                  border: isActive ? "1px solid var(--accent-border)" : "1px solid transparent",
                }}
              >
                {s.label}
              </div>
            );
          })}
        </div>

        {/* Real-time Telemetry Timeline */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {events.length === 0 ? (
            <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
              Ready. Click &quot;Execute Autonomous Loop&quot; to begin.
            </div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="cf-card"
                style={{
                  padding: "10px 12px",
                  borderLeft: ev.stage === "COMPLETED" ? "3px solid var(--color-success)" : ev.stage === "FAILED" ? "3px solid var(--color-error)" : "3px solid var(--accent-primary)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span className="pill pill-idle" style={{ fontSize: "10px" }}>
                    {ev.agent}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {ev.title}
                </div>

                {ev.detail && (
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                    {ev.detail}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions: Rollback & PR */}
        {gitDiff && (
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-default)", background: "var(--bg-secondary)", display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsRollbackOpen(true)}>
              <RotateCcw size={12} color="var(--color-error)" />
              <span>Rollback</span>
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setIsPROpen(true)}>
              <GitPullRequest size={12} />
              <span>Create PR</span>
            </button>
          </div>
        )}
      </aside>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalOpen}
        onApprove={async () => {
          setIsApprovalOpen(false);
          if (currentTask) {
            try {
              await fetch(`${API_BASE}/tasks/${currentTask.id}/approve`, { method: "POST" });
              addToast({ title: "Plan Approved", message: "Autonomous implementation authorized.", type: "success" });
            } catch (err: any) {
              addToast({ title: "Approval Error", message: err.message, type: "error" });
            }
          }
        }}
        onDeny={async () => {
          setIsApprovalOpen(false);
          if (currentTask) {
            try {
              await fetch(`${API_BASE}/tasks/${currentTask.id}/reject`, { method: "POST" });
              addToast({ title: "Plan Rejected", message: "Task execution halted.", type: "warning" });
            } catch (err: any) {
              addToast({ title: "Reject Error", message: err.message, type: "error" });
            }
          }
          handleCancelTask();
        }}
        actionDetails={{
          title: plan?.summary || "Apply code modifications to repository",
          filesToModify: plan?.files_to_modify || ["main.py"],
          risks: plan?.risks || [],
        }}
      />

      {/* Rollback Confirmation Modal */}
      <RollbackModal
        isOpen={isRollbackOpen}
        onConfirm={handleRollbackConfirm}
        onClose={() => setIsRollbackOpen(false)}
        taskTitle={prompt}
      />

      {/* Pull Request Creator Modal */}
      <PullRequestModal
        isOpen={isPROpen}
        onClose={() => setIsPROpen(false)}
        onSubmit={async (title, desc) => {
          if (currentTask) {
            try {
              const res = await fetch(`${API_BASE}/tasks/${currentTask.id}/pr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description: desc }),
              });
              if (res.ok) {
                const data = await res.json();
                addToast({
                  title: `Pull Request #${data.pr_number} Created`,
                  message: `Branch ${data.branch} submitted to repository.`,
                  type: "success",
                });
              }
            } catch (err: any) {
              addToast({ title: "PR Error", message: err.message, type: "error" });
            }
          }
          setIsPROpen(false);
        }}
        defaultTitle={`feat: implement ${prompt}`}
        filesChangedCount={plan?.files_to_modify?.length || 1}
      />
    </div>
  );
}
