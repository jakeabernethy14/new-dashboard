"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
import { mockClients, mockInvoices } from "@/lib/mock-data";
import type { Client, Invoice } from "@/lib/types";
import { DollarSign, TrendingUp, Receipt } from "lucide-react";

type Range = "weekly" | "monthly" | "yearly";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function isoWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export default function EarningsPage() {
  const { data: clients } = useSupabaseTable<Client>("clients", mockClients);
  const { data: invoices, loading } = useSupabaseTable<Invoice>("invoices", mockInvoices, {
    orderColumn: "issue_date",
  });
  const [range, setRange] = useState<Range>("monthly");

  const paidInvoices = useMemo(() => invoices.filter((i) => i.status === "paid"), [invoices]);

  const buckets = useMemo(() => {
    const map = new Map<string, { label: string; total: number; sortKey: string }>();

    paidInvoices.forEach((inv) => {
      const d = new Date(inv.issue_date);
      let key: string;
      let label: string;

      if (range === "weekly") {
        key = isoWeek(d);
        label = key.split("-W")[1] ? `Wk ${key.split("-W")[1]}` : key;
      } else if (range === "monthly") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      } else {
        key = String(d.getFullYear());
        label = key;
      }

      const existing = map.get(key);
      if (existing) {
        existing.total += inv.amount;
      } else {
        map.set(key, { label, total: inv.amount, sortKey: key });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-12);
  }, [paidInvoices, range]);

  const totalEarnings = useMemo(() => paidInvoices.reduce((s, i) => s + i.amount, 0), [paidInvoices]);
  const avgPerInvoice = paidInvoices.length ? totalEarnings / paidInvoices.length : 0;
  const topClient = useMemo(() => {
    const byClient = new Map<string, number>();
    paidInvoices.forEach((i) => byClient.set(i.client_id, (byClient.get(i.client_id) ?? 0) + i.amount));
    let best: { id: string; total: number } | null = null;
    byClient.forEach((total, id) => {
      if (!best || total > best.total) best = { id, total };
    });
    if (!best) return null;
    const client = clients.find((c) => c.id === (best as { id: string }).id);
    return { name: client?.name ?? "Unknown", total: (best as { total: number }).total };
  }, [paidInvoices, clients]);

  return (
    <div>
      <PageHeader
        title="Earnings"
        subtitle="Revenue from paid invoices, broken down by period"
        action={
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="rounded-lg bg-base-850 border border-line px-3 py-2 text-sm text-ink-100 outline-none focus:border-bright-500 cursor-pointer"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        }
      />

      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Total earnings" value={currency(totalEarnings)} sub={`${paidInvoices.length} paid invoices`} icon={DollarSign} accent="mint" />
          <KpiCard label="Avg. per invoice" value={currency(avgPerInvoice)} icon={Receipt} accent="bright" />
          <KpiCard label="Top client" value={topClient?.name ?? "—"} sub={topClient ? currency(topClient.total) : undefined} icon={TrendingUp} accent="amber" />
        </div>

        <div className="rounded-xl border border-line bg-base-900/60 p-5">
          <p className="font-display text-sm text-ink-100 mb-4 capitalize">{range} earnings</p>
          {loading ? (
            <p className="text-sm text-ink-500">Loading…</p>
          ) : buckets.length === 0 ? (
            <p className="text-sm text-ink-500">No paid invoices yet for this view.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buckets} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1c3252" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="#5c7290" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5c7290" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: "#0d1c33", border: "1px solid #1c3252", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#c3d3e8" }}
                    formatter={(v) => [currency(Number(v)), "Earnings"]}
                  />
                  <Bar dataKey="total" fill="#00c2ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-base-900/60 overflow-hidden overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="border-b border-line text-left text-xs font-medium text-ink-700">
                <th className="px-5 py-3 font-medium capitalize">{range === "weekly" ? "Week" : range === "monthly" ? "Month" : "Year"}</th>
                <th className="px-5 py-3 font-medium">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {[...buckets].reverse().map((b) => (
                <tr key={b.sortKey} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 text-ink-300">{b.label}</td>
                  <td className="px-5 py-3 font-mono text-ink-100">{currency(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
