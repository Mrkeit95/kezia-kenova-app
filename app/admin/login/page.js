"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import LoadingScreen from "@/components/LoadingScreen";
import "../../globals.css";
import "../admin.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Wrong email or password.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <>
      <LoadingScreen />
      <main className="login-page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="login-card">
          <div className="login-logo">K</div>
          <h1 className="login-title">Kezia Kenova</h1>
          <p className="login-sub">Admin Portal</p>

          <form onSubmit={handleLogin} className="login-form">
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
