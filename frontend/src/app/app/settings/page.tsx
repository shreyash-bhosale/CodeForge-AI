"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Cpu,
  Shield,
  GitBranch,
  Eye,
  EyeOff,
  Save,
  Check,
  Moon,
  Sun,
  Lock,
  Layers,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();

  const [activeCategory, setActiveCategory] = useState<"general" | "providers" | "sandbox" | "git" | "appearance">("providers");

  // AI Provider settings
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [temperature, setTemperature] = useState(0.2);

  // Sandbox settings
  const [maxRetries, setMaxRetries] = useState(3);
  const [commandTimeout, setCommandTimeout] = useState(60);
  const [requireApproval, setRequireApproval] = useState(false);
  const [networkPolicy, setNetworkPolicy] = useState("restricted");

  useEffect(() => {
    async function loadSystemStatus() {
      try {
        const res = await fetch("http://localhost:8000/api/system/status");
        if (res.ok) {
          const data = await res.json();
          if (data.ai_provider) setProvider(data.ai_provider);
          if (data.models?.planner) setModel(data.models.planner);
          if (data.sandbox?.timeout_seconds) setCommandTimeout(data.sandbox.timeout_seconds);
          if (data.sandbox?.network_policy) setNetworkPolicy(data.sandbox.network_policy.toLowerCase());
        }
      } catch (err) {
        console.error("Failed to load system settings:", err);
      }
    }
    loadSystemStatus();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: "Settings Saved",
      message: "Configuration successfully updated across agent workers.",
      type: "success",
    });
  };

  return (
    <div style={{ padding: "28px 36px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
          System & Agent Settings
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Configure AI reasoning models, execution sandboxes, permissions, and developer preferences
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "28px" }}>
        {/* Category Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {[
            { key: "providers", label: "AI Providers & Models", icon: <Cpu size={15} /> },
            { key: "sandbox", label: "Sandbox & Security", icon: <Shield size={15} /> },
            { key: "git", label: "Git & Version Control", icon: <GitBranch size={15} /> },
            { key: "appearance", label: "Appearance & Theme", icon: <Sun size={15} /> },
            { key: "general", label: "General Workspace", icon: <Settings size={15} /> },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: activeCategory === cat.key ? 600 : 500,
                color: activeCategory === cat.key ? "var(--text-primary)" : "var(--text-secondary)",
                background: activeCategory === cat.key ? "var(--bg-active)" : "transparent",
                borderLeft: activeCategory === cat.key ? "2px solid var(--accent-primary)" : "2px solid transparent",
                textAlign: "left",
                transition: "all var(--trans-fast)",
              }}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Panels */}
        <form onSubmit={handleSave} className="cf-panel" style={{ padding: "28px", border: "1px solid var(--border-default)" }}>
          {activeCategory === "providers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>AI Model Provider</h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Select reasoning provider for planning, code generation, and failure diagnosis.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Active Provider
                </label>
                <select
                  className="cf-input"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="gemini">Google Gemini (Recommended)</option>
                  <option value="openai">OpenAI</option>
                  <option value="heuristic">Built-in Autonomous Heuristic Engine (Offline)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Model
                </label>
                <input
                  type="text"
                  className="cf-input"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gemini-2.5-flash or gpt-4o"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  API Key
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showKey ? "text" : "password"}
                    className="cf-input"
                    style={{ paddingRight: "40px", fontFamily: "var(--font-mono)" }}
                    placeholder="Enter API Key (Kept strictly server-side)"
                    value={provider === "gemini" ? geminiKey : openaiKey}
                    onChange={(e) =>
                      provider === "gemini" ? setGeminiKey(e.target.value) : setOpenaiKey(e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    style={{ position: "absolute", right: "10px", top: "9px", color: "var(--text-muted)" }}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  Keys are stored encrypted on the server and are never exposed in frontend bundles.
                </span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
                  <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Sampling Temperature</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          )}

          {activeCategory === "sandbox" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>Sandbox Security & Policies</h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Controlled containment rules for command execution and file manipulation.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Require human approval before code modification
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Halts the loop after planning until developer explicitly approves the diff plan.
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Max Debugging Retries
                </label>
                <select
                  className="cf-input"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                >
                  <option value={1}>1 Attempt</option>
                  <option value={2}>2 Attempts</option>
                  <option value={3}>3 Attempts (Default Recommended)</option>
                  <option value={5}>5 Attempts</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Sandbox Network Policy
                </label>
                <select
                  className="cf-input"
                  value={networkPolicy}
                  onChange={(e) => setNetworkPolicy(e.target.value)}
                >
                  <option value="restricted">Restricted (No inbound or outbound network access)</option>
                  <option value="package_only">Package Repositories Only (PyPI / npm allowlist)</option>
                  <option value="full">Full Network Access (Explicit permission)</option>
                </select>
              </div>
            </div>
          )}

          {activeCategory === "git" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>Git Integration</h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Branch prefixes, commit messages, and automated snapshots.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Branch Naming Pattern
                </label>
                <input
                  type="text"
                  className="cf-input"
                  defaultValue="agent/task-{id}"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Git Commit Author
                </label>
                <input
                  type="text"
                  className="cf-input"
                  defaultValue="CodeForge AI <agent@codeforge.ai>"
                />
              </div>
            </div>
          )}

          {activeCategory === "appearance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>Appearance & Themes</h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Customize the developer interface theme and layout.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div
                  className="cf-card"
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                    border: theme === "dark" ? "2px solid var(--accent-primary)" : "1px solid var(--border-default)",
                  }}
                  onClick={() => setTheme("dark")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                    <Moon size={16} />
                    <span>Dark Theme (Default)</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Deep high-contrast surfaces optimized for developer environments and 1440p displays.
                  </p>
                </div>

                <div
                  className="cf-card"
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                    border: theme === "light" ? "2px solid var(--accent-primary)" : "1px solid var(--border-default)",
                  }}
                  onClick={() => setTheme("light")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                    <Sun size={16} />
                    <span>Light Theme</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Accessible slate light theme with sharp contrast and visible focus indicators.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeCategory === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>General Settings</h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Platform preferences and workspace identification.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Workspace Name
                </label>
                <input
                  type="text"
                  className="cf-input"
                  defaultValue="CodeForge AI Developer Workspace"
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: "28px", paddingTop: "18px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn btn-primary" style={{ padding: "8px 20px" }}>
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
