"use client";

import React, { useRef, useEffect } from "react";
import { Play, Activity, Sparkles, Terminal, CheckCircle2, AlertTriangle, Bug, Code, Compass, Wrench } from "lucide-react";

export interface TimelineEvent {
  id: string;
  agent: string;
  stage: string;
  event_type: string;
  title: string;
  detail?: string | null;
  data?: any;
  timestamp: string;
}

interface AgentTimelineProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onExecute: () => void;
  isRunning: boolean;
  events: TimelineEvent[];
  currentStage: string;
}

const STAGES = [
  { key: "ANALYZING", label: "Understand" },
  { key: "PLANNING", label: "Plan" },
  { key: "IMPLEMENTING", label: "Implement" },
  { key: "TESTING", label: "Test" },
  { key: "DEBUGGING", label: "Debug" },
  { key: "VERIFYING", label: "Verify" },
];

export const AgentTimeline: React.FC<AgentTimelineProps> = ({
  prompt,
  setPrompt,
  onExecute,
  isRunning,
  events,
  currentStage,
}) => {
  const timelineEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const getAgentIcon = (agent: string) => {
    switch (agent.toLowerCase()) {
      case "analyzer":
        return <Compass size={13} color="#06b6d4" />;
      case "planner":
        return <Sparkles size={13} color="#818cf8" />;
      case "coder":
        return <Code size={13} color="#a855f7" />;
      case "executor":
        return <Terminal size={13} color="#10b981" />;
      case "debugger":
        return <Bug size={13} color="#f59e0b" />;
      case "verifier":
        return <CheckCircle2 size={13} color="#06b6d4" />;
      default:
        return <Activity size={13} color="#94a3b8" />;
    }
  };

  const getCardStageClass = (event: TimelineEvent) => {
    if (event.event_type === "error" || event.stage === "FAILED") return "stage-error";
    if (event.stage === "COMPLETED" || event.event_type === "summary") return "stage-success";
    return "stage-active";
  };

  return (
    <aside className="glass-panel activity-panel">
      {/* Header */}
      <div className="panel-header">
        <span>Agent Activity & Telemetry</span>
        <Activity size={14} color="var(--accent-indigo)" />
      </div>

      {/* Task Prompt Area */}
      <div className="task-input-box">
        <textarea
          className="prompt-textarea"
          placeholder="Describe your engineering objective (e.g. 'Add a /health endpoint returning application status' or 'Fix test assertion failure')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isRunning}
        />

        <div className="chip-container">
          <button
            type="button"
            className="chip-btn"
            onClick={() => setPrompt("Add a /health endpoint returning application status")}
            disabled={isRunning}
          >
            + Add /health endpoint
          </button>
          <button
            type="button"
            className="chip-btn"
            onClick={() => setPrompt("Verify test suite and resolve any assertion failures")}
            disabled={isRunning}
          >
            ⚡ Test & Debug Assertions
          </button>
          <button
            type="button"
            className="chip-btn"
            onClick={() => setPrompt("Analyze architecture and identify test entry points")}
            disabled={isRunning}
          >
            🔍 Analyze Repository
          </button>
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn-primary"
            onClick={onExecute}
            disabled={isRunning || !prompt.trim()}
          >
            <Play size={14} fill={isRunning ? "none" : "currentColor"} />
            <span>{isRunning ? "Engineering Loop Running..." : "Execute Autonomous Loop"}</span>
          </button>
        </div>
      </div>

      {/* Loop Stage Progress Indicators */}
      <div style={{ display: "flex", padding: "8px 12px", background: "rgba(10, 13, 20, 0.4)", borderBottom: "1px solid var(--border-subtle)", gap: 4, overflowX: "auto" }}>
        {STAGES.map((s) => {
          const isActive = currentStage === s.key;
          return (
            <div
              key={s.key}
              style={{
                fontSize: "0.68rem",
                padding: "3px 8px",
                borderRadius: 4,
                whiteSpace: "nowrap",
                fontWeight: isActive ? 700 : 500,
                background: isActive ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.04)",
                color: isActive ? "#c7d2fe" : "var(--text-muted)",
                border: isActive ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid transparent",
              }}
            >
              {s.label}
            </div>
          );
        })}
      </div>

      {/* Real-time Telemetry Timeline */}
      <div className="timeline-container">
        {events.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", padding: "30px 10px" }}>
            Ready. Enter an engineering task above to start the autonomous loop.
          </div>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className={`timeline-card ${getCardStageClass(ev)}`}>
              <div className="card-meta">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {getAgentIcon(ev.agent)}
                  <span className="agent-badge">{ev.agent}</span>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="card-title">{ev.title}</div>

              {ev.detail && <div className="card-detail">{ev.detail}</div>}

              {/* Data logs drawer for test stdout/stderr or fix classifications */}
              {ev.data && ev.data.stdout && (
                <div style={{ marginTop: 8, padding: "6px 8px", background: "rgba(0,0,0,0.4)", borderRadius: 4, fontSize: "0.72rem", fontFamily: "monospace", color: "#a5b4fc", maxHeight: "120px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                  {ev.data.stdout}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={timelineEndRef} />
      </div>
    </aside>
  );
};
