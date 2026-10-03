"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, FolderGit2, TestTube2, History, BarChart3, Settings, Moon, Sun, ArrowRight, CornerDownLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: "run-agent",
      title: "Run Autonomous AI Coding Engineer",
      category: "AI Agent",
      icon: <Sparkles size={16} color="var(--accent-primary)" />,
      shortcut: "⌘↵",
      action: () => {
        router.push("/app");
        onClose();
      },
    },
    {
      id: "view-workspace",
      title: "Open Active Repository Workspace",
      category: "Navigation",
      icon: <FolderGit2 size={16} color="#818cf8" />,
      action: () => {
        router.push("/app");
        onClose();
      },
    },
    {
      id: "view-repos",
      title: "Manage & Connect Repositories",
      category: "Navigation",
      icon: <FolderGit2 size={16} color="#06b6d4" />,
      action: () => {
        router.push("/app/repositories");
        onClose();
      },
    },
    {
      id: "view-runs",
      title: "View Agent Runs & Audit History",
      category: "Observability",
      icon: <History size={16} color="#10b981" />,
      action: () => {
        router.push("/app/agents");
        onClose();
      },
    },
    {
      id: "view-evals",
      title: "Open Agent Evaluation Dashboard",
      category: "Observability",
      icon: <BarChart3 size={16} color="#f59e0b" />,
      action: () => {
        router.push("/app/evaluations");
        onClose();
      },
    },
    {
      id: "settings",
      title: "System & AI Provider Settings",
      category: "Preferences",
      icon: <Settings size={16} color="var(--text-muted)" />,
      shortcut: "⌘,",
      action: () => {
        router.push("/app/settings");
        onClose();
      },
    },
    {
      id: "toggle-theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      category: "Preferences",
      icon: theme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
      action: () => {
        toggleTheme();
        onClose();
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filtered, onClose]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command Palette">
      <div className="command-palette-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid var(--border-default)" }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            className="cf-input"
            style={{ border: "none", background: "transparent", padding: 0, fontSize: "15px" }}
            placeholder="Type a command or search actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)" }}>
            ESC
          </span>
        </div>

        <div style={{ maxHeight: "340px", overflowY: "auto", padding: "8px 0" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No commands found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`command-item ${idx === selectedIndex ? "selected" : ""}`}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {cmd.icon}
                  <div>
                    <div>{cmd.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{cmd.category}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {cmd.shortcut && (
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {cmd.shortcut}
                    </span>
                  )}
                  {idx === selectedIndex && <CornerDownLeft size={13} color="var(--text-muted)" />}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-muted)" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div>CodeForge AI Command Hub</div>
        </div>
      </div>
    </div>
  );
};
