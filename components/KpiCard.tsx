import type { LucideIcon } from "lucide-react";

export default function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "bright",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: "bright" | "mint" | "amber" | "coral";
}) {
  const accentColor = {
    bright: "text-bright-400 bg-bright-500/10",
    mint: "text-mint-400 bg-mint-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    coral: "text-coral-400 bg-coral-400/10",
  }[accent];

  const barColor = {
    bright: "bg-bright-500",
    mint: "bg-mint-400",
    amber: "bg-amber-400",
    coral: "bg-coral-400",
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-base-900/60 p-5">
      <div className={`absolute left-0 top-0 h-full w-0.5 ${barColor}`} />
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${accentColor}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </div>
      </div>
      <p className="font-display text-2xl text-ink-100 mt-3 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-ink-500 mt-1">{sub}</p>}
    </div>
  );
}
