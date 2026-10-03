"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Code2,
  History,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
} from "lucide-react";

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "Overview", href: "/app", icon: <LayoutDashboard size={17} /> },
    { label: "Repositories", href: "/app/repositories", icon: <FolderGit2 size={17} /> },
    { label: "Workspace", href: "/app/repositories/active", icon: <Code2 size={17} /> },
    { label: "Agent Runs", href: "/app/agents", icon: <History size={17} /> },
    { label: "Evaluations", href: "/app/evaluations", icon: <BarChart3 size={17} /> },
    { label: "Settings", href: "/app/settings", icon: <Settings size={17} /> },
  ];

  return (
    <aside
      style={{
        width: collapsed ? "54px" : "210px",
        background: "var(--bg-primary)",
        borderRight: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width var(--trans-normal)",
        userSelect: "none",
        zIndex: 50,
      }}
    >
      {/* Top Nav List */}
      <div style={{ padding: "10px 6px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: collapsed ? "10px" : "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "var(--bg-active)" : "transparent",
                  borderLeft: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  transition: "all var(--trans-fast)",
                  textDecoration: "none",
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
                title={collapsed ? item.label : undefined}
              >
                <div style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}>
                  {item.icon}
                </div>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Engineering loop badge & Collapse button */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border-subtle)" }}>
        {!collapsed && (
          <div
            style={{
              padding: "10px",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "8px",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: "var(--accent-primary)", marginBottom: "4px" }}>
              <Sparkles size={12} />
              <span>AUTONOMOUS LOOP</span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Plan → Code → Test → Debug → Ship
            </p>
          </div>
        )}

        <button
          className="btn-ghost"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: "6px 8px",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!collapsed && <span>Collapse Sidebar</span>}
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  );
};
