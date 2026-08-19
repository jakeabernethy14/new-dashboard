import { createBrowserClient } from "@supabase/ssr";

const REMEMBER_KEY = "reel-ops-remember-me";

// "Remember me" controls where the session token lives: localStorage (survives
// closing the browser) or sessionStorage (cleared when the browser closes).
// The choice itself is saved as a small non-sensitive flag in localStorage so
// every createClient() call anywhere in the app agrees on the same storage.
export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
}

function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  const saved = window.localStorage.getItem(REMEMBER_KEY);
  return saved === null ? true : saved === "true";
}

export function createClient() {
  const remember = getRememberMe();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: remember ? window.localStorage : window.sessionStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
}

// True once real Supabase credentials are set. Until then, pages fall back
// to demo data so you can preview the design before wiring up the database.
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_SUPABASE");
