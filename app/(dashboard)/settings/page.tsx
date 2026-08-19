"use client";

import PageHeader from "@/components/PageHeader";
import { useAppSettings } from "@/lib/useAppSettings";
import { useTheme } from "@/lib/ThemeProvider";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Sun, Moon, ExternalLink, Mail, UserPlus } from "lucide-react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
        checked ? "bg-bright-500" : "bg-base-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-base-950 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-line last:border-0">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-base-850 border border-line flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="h-4 w-4 text-ink-500" />
        </div>
        <div>
          <p className="text-sm text-ink-100 font-medium">{title}</p>
          <p className="text-xs text-ink-500 mt-0.5 leading-relaxed max-w-md">{description}</p>
        </div>
      </div>
      <div className="shrink-0 pt-1.5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useAppSettings();
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Studio-wide preferences" />

      <div className="px-6 md:px-8 pb-10 max-w-2xl space-y-6">
        <div className="rounded-xl border border-line bg-base-900/60 p-5">
          <p className="font-display text-sm text-ink-100 mb-1">Access</p>
          <p className="text-xs text-ink-500 mb-2">Control who can get into this dashboard.</p>

          <SettingRow
            icon={UserPlus}
            title="Allow new sign-ups"
            description="When off, the login page only shows Sign in — no one can create a new account from the front page."
          >
            <Toggle
              checked={settings.allow_registration}
              onChange={(v) => updateSettings({ allow_registration: v })}
            />
          </SettingRow>

          <SettingRow
            icon={Mail}
            title="Email confirmation on sign-up"
            description="This is a Supabase project-level setting, not something the app itself can flip — the anon key isn't allowed to change it for security reasons. Turn it off in your Supabase dashboard under Authentication → Sign In / Providers → Email."
          >
            <a
              href="https://supabase.com/dashboard/project/_/auth/providers"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-bright-400 hover:text-bright-300 border border-bright-500/25 rounded-lg px-3 py-1.5 transition-colors"
            >
              Open in Supabase <ExternalLink className="h-3 w-3" />
            </a>
          </SettingRow>
        </div>

        <div className="rounded-xl border border-line bg-base-900/60 p-5">
          <p className="font-display text-sm text-ink-100 mb-1">Appearance</p>
          <p className="text-xs text-ink-500 mb-2">Switch how the dashboard looks on this device.</p>

          <SettingRow
            icon={theme === "dark" ? Moon : Sun}
            title="Theme"
            description="Dark is the studio default. Light mode swaps in a bright, high-contrast palette using the same accent colors."
          >
            <div className="flex rounded-lg bg-base-850 border border-line p-1 text-xs">
              <button
                onClick={() => setTheme("dark")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  theme === "dark" ? "bg-bright-500 text-base-950" : "text-ink-500"
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  theme === "light" ? "bg-bright-500 text-base-950" : "text-ink-500"
                }`}
              >
                Light
              </button>
            </div>
          </SettingRow>
        </div>

        {!isSupabaseConfigured && (
          <p className="text-xs text-ink-500">
            You're in demo mode — these preferences save to this browser only. Connect Supabase to make
            them apply everywhere you sign in.
          </p>
        )}
        {loading && <p className="text-xs text-ink-500">Loading settings…</p>}
      </div>
    </div>
  );
}
