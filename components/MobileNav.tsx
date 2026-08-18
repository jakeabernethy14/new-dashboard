"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Wrench, CalendarDays } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-base-900/95 border-t border-line backdrop-blur-sm">
      <div className="flex items-stretch justify-between px-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
                active ? "text-bright-400" : "text-ink-700"
              }`}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
