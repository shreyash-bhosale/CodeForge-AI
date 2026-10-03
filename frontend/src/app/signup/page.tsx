"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, ArrowRight, Lock, Mail, User } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { useToast } from "@/context/ToastContext";

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState("Alex Developer");
  const [email, setEmail] = useState("alex@codeforge.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: name }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Registration failed");
      }
      const data = await res.json();
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("codeforge_token", data.token);
      }
      addToast({
        title: "Account Created",
        message: `Welcome to CodeForge AI, ${data.full_name || data.email}`,
        type: "success",
      });
      router.push("/app");
    } catch (err: any) {
      addToast({
        title: "Registration Failed",
        message: err.message || "Failed to create account",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-canvas)", padding: "20px" }}>
      <div className="cf-card" style={{ width: "100%", maxWidth: "420px", padding: "32px", border: "1px solid var(--border-default)" }}>
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
            Create CodeForge AI Account
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Start building with autonomous coding engineers
          </p>
        </div>

        <button
          className="btn btn-secondary"
          style={{ width: "100%", padding: "10px", marginBottom: "20px", justifyContent: "center" }}
          onClick={() => {
            addToast({ title: "GitHub OAuth", message: "Connecting with GitHub...", type: "info" });
            router.push("/app");
          }}
        >
          <GithubIcon size={16} />
          <span>Sign up with GitHub</span>
        </button>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="cf-input"
                style={{ paddingLeft: "34px" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <User size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--text-muted)" }} />
            </div>
          </div>

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
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Password
            </label>
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
            <span>{isLoading ? "Creating account..." : "Start Free Workspace"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
