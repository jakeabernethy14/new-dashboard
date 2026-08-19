"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AppSettings } from "@/lib/types";

const DEFAULTS: AppSettings = { allow_registration: true, theme_default: "dark" };
const LOCAL_KEY = "reel-ops-app-settings";

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      try {
        const saved = localStorage.getItem(LOCAL_KEY);
        setSettings(saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS);
      } catch {
        setSettings(DEFAULTS);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSettings(DEFAULTS);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("app_settings").select("*").eq("user_id", user.id).maybeSingle();
    if (data) {
      setSettings({ allow_registration: data.allow_registration, theme_default: data.theme_default });
    } else {
      await supabase.from("app_settings").insert({ user_id: user.id, ...DEFAULTS });
      setSettings(DEFAULTS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateSettings(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);

    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("app_settings").upsert({ user_id: user.id, ...next, updated_at: new Date().toISOString() });
  }

  return { settings, loading, updateSettings };
}
