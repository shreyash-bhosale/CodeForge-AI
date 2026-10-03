"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, ArrowRight, Lock, Mail } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState("developer@codeforge.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Authentication failed");
      }
      const data = await res.json();
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("codeforge_token", data.token);
      }
      addToast({
        title: "Authenticated Successfully",
        message: `Welcome back, ${data.full_name || data.email}`,
        type: "success",
      });
      router.push("/app");
    } catch (err: any) {
      addToast({
        title: "Authentication Failed",
        message: err.message || "Invalid credentials",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-canvas)", padding: "20px" }}>
      <div className="cf-card" style={{ width: "100%", maxWidth: "420px", padding: "32px", border: "1px solid var(--border-default)" }}>
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-sm)",
              background: "var(--accent-primary)",
              color: "#08090b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <Cpu size={24} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
            Sign in to CodeForge AI
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Autonomous engineering environment
          </p>
        </div>

        {/* OAuth Buttons */}
        <button
          className="btn btn-secondary"
          style={{ width: "100%", padding: "10px", marginBottom: "20px", justifyContent: "center" }}
          onClick={() => {
            addToast({ title: "GitHub OAuth", message: "Connecting via GitHub...", type: "info" });
            router.push("/app");
          }}
        >
          <GithubIcon size={16} />
          <span>Continue with GitHub</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>OR EMAIL</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Work Email
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                className="cf-input"
                style={{ paddingLeft: "34px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--text-muted)" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                Password
              </label>
              <a href="#" style={{ fontSize: "11px", color: "var(--accent-primary)" }}>
                Forgot?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="cf-input"
                style={{ paddingLeft: "34px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--text-muted)" }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: "10px", width: "100%", marginTop: "8px" }} disabled={isLoading}>
            <span>{isLoading ? "Signing in..." : "Sign In to Workspace"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
