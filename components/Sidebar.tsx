"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  CalendarDays,
  Film,
  LogOut,
  TrendingUp,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/services", label: "Outgoing services", icon: Wrench },
  { href: "/earnings", label: "Earnings", icon: TrendingUp },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

const NAV_BOTTOM = [{ href: "/settings", label: "Settings", icon: Settings }];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-line bg-base-900/60 h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-line">
        <div className="h-8 w-8 rounded-lg bg-base-850 border border-line flex items-center justify-center">
          <Film className="h-4 w-4 text-bright-400" strokeWidth={1.75} />
        </div>
        <span className="font-display text-[15px] text-ink-100 tracking-tight">My Dashboard</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-bright-500/10 text-bright-300 border border-bright-500/20"
                  : "text-ink-500 hover:text-ink-100 hover:bg-base-850 border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-2 pb-3 border-t border-line space-y-1">
        {NAV_BOTTOM.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-bright-500/10 text-bright-300 border border-bright-500/20"
                  : "text-ink-500 hover:text-ink-100 hover:bg-base-850 border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="px-3 pb-5">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-500 hover:text-coral-400 hover:bg-base-850 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
