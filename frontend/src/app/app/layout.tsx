"use client";

import React, { useState, useEffect } from "react";
import { AppTopBar } from "@/components/AppTopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [activeRepo, setActiveRepo] = useState<any>(null);

  // Global ⌘K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="main-viewport">
        <AppTopBar
          repoName={activeRepo?.name || "Sample Microservice"}
          branchName="main"
          agentStatus="IDLE"
          onOpenCommandPalette={() => setIsCommandOpen(true)}
        />
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {children}
        </div>
      </div>
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
}
