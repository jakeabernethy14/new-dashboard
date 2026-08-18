const STYLES: Record<string, string> = {
  active: "bg-mint-400/10 text-mint-400 border-mint-400/25",
  paid: "bg-mint-400/10 text-mint-400 border-mint-400/25",
  sent: "bg-bright-500/10 text-bright-300 border-bright-500/25",
  draft: "bg-ink-700/10 text-ink-500 border-line",
  overdue: "bg-coral-400/10 text-coral-400 border-coral-400/25",
  past: "bg-ink-700/10 text-ink-500 border-line",
  lead: "bg-amber-400/10 text-amber-400 border-amber-400/25",
  paused: "bg-amber-400/10 text-amber-400 border-amber-400/25",
  cancelled: "bg-coral-400/10 text-coral-400 border-coral-400/25",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
        STYLES[status] ?? "bg-ink-700/10 text-ink-500 border-line"
      }`}
    >
      {status}
    </span>
  );
}
