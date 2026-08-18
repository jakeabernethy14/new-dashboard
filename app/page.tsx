"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Film, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured) {
      setError("Connect your Supabase project first — see README for setup steps.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setMessage("Account created. Check your email to confirm, then sign in.");
      setMode("sign-in");
    }
  }

  return (
    <div className="relative min-h-screen bg-base-950 flex items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 frame-grid" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-bright-500/15 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-11 w-11 rounded-xl bg-base-850 border border-line flex items-center justify-center mb-4">
            <Film className="h-5 w-5 text-bright-400" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-xl text-ink-100 tracking-tight">Reel Ops</h1>
          <p className="text-sm text-ink-500 mt-1">Studio dashboard for your edit business</p>
        </div>

        <div className="bg-base-900/80 border border-line rounded-2xl p-6 backdrop-blur-sm shadow-[0_0_0_1px_rgba(47,176,255,0.03)]">
          <div className="flex rounded-lg bg-base-850 p-1 mb-6 text-sm">
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors cursor-pointer ${
                mode === "sign-in" ? "bg-bright-500 text-base-950" : "text-ink-500 hover:text-ink-300"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("sign-up")}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors cursor-pointer ${
                mode === "sign-up" ? "bg-bright-500 text-base-950" : "text-ink-500 hover:text-ink-300"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full rounded-lg bg-base-850 border border-line px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-base-850 border border-line px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-coral-400 bg-coral-400/10 border border-coral-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-mint-400 bg-mint-400/10 border border-mint-400/20 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 font-semibold text-sm py-2.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs text-ink-500 hover:text-bright-400 transition-colors cursor-pointer underline underline-offset-4 decoration-line"
          >
            {isSupabaseConfigured ? "Skip for now" : "Preview dashboard with demo data →"}
          </button>
        </div>
      </div>
    </div>
  );
}
