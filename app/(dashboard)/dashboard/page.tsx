"use client";

import { useMemo } from "react";
import { DollarSign, Clock, Users, Wallet, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MiniCalendar from "@/components/MiniCalendar";
import NotesPanel from "@/components/NotesPanel";
import StatusBadge from "@/components/StatusBadge";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
import { mockClients, mockInvoices, mockServices, mockEvents } from "@/lib/mock-data";
import type { Client, Invoice, Service, CalendarEvent } from "@/lib/types";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function DashboardPage() {
  const { data: clients } = useSupabaseTable<Client>("clients", mockClients);
  const { data: invoices } = useSupabaseTable<Invoice>("invoices", mockInvoices);
  const { data: services } = useSupabaseTable<Service>("services", mockServices);
  const { data: events } = useSupabaseTable<CalendarEvent>("calendar_events", mockEvents, {
    orderColumn: "start_time",
    ascending: true,
  });

  const totalRevenue = useMemo(
    () => invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
    [invoices]
  );
  const outstanding = useMemo(
    () => invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0),
    [invoices]
  );
  const activeClients = clients.filter((c) => c.status === "active").length;
  const monthlyOutgoing = useMemo(
    () =>
      services.reduce((s, svc) => {
        if (svc.status !== "active") return s;
        if (svc.billing_cycle === "monthly") return s + svc.cost;
        if (svc.billing_cycle === "yearly") return s + svc.cost / 12;
        return s;
      }, 0),
    [services]
  );

  const chartData = useMemo(() => {
    const months: { key: string; label: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-US", { month: "short" }),
        revenue: 0,
      });
    }
    invoices
      .filter((i) => i.status === "paid")
      .forEach((i) => {
        const d = new Date(i.issue_date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const m = months.find((m) => m.key === key);
        if (m) m.revenue += i.amount;
      });
    return months;
  }, [invoices]);

  const upcomingInvoices = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 4);

  const upcomingEvents = events
    .filter((e) => new Date(e.start_time) >= new Date(new Date().toDateString()))
    .slice(0, 4);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Here's how the studio is tracking." />

      <div className="px-6 md:px-8 pb-10 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total revenue" value={currency(totalRevenue)} sub="All paid invoices" icon={DollarSign} accent="mint" />
          <KpiCard label="Outstanding" value={currency(outstanding)} sub="Sent + overdue" icon={Clock} accent="amber" />
          <KpiCard label="Active clients" value={String(activeClients)} sub={`${clients.length} total`} icon={Users} accent="bright" />
          <KpiCard label="Monthly outgoing" value={currency(monthlyOutgoing)} sub="Active subscriptions" icon={Wallet} accent="coral" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-line bg-base-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-sm text-ink-100">Revenue, last 6 months</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2fb0ff" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2fb0ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1c3252" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="#5c7290" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#5c7290"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d1c33",
                      border: "1px solid #1c3252",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#c3d3e8" }}
                    formatter={(v) => [currency(Number(v)), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2fb0ff" strokeWidth={2} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <MiniCalendar events={events} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-line bg-base-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-sm text-ink-100">Invoices needing attention</p>
              <a href="/invoices" className="text-xs text-bright-400 hover:text-bright-300 flex items-center gap-0.5">
                View all <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
            {upcomingInvoices.length === 0 ? (
              <p className="text-xs text-ink-500">Nothing outstanding — nice.</p>
            ) : (
              <div className="space-y-1">
                {upcomingInvoices.map((inv) => {
                  const client = clients.find((c) => c.id === inv.client_id);
                  return (
                    <div key={inv.id} className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
                      <div>
                        <p className="text-sm text-ink-100">{client?.name ?? "Unknown client"}</p>
                        <p className="text-xs text-ink-500">
                          Due {new Date(inv.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-ink-100">{currency(inv.amount)}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-line">
              <p className="font-display text-sm text-ink-100 mb-3">Coming up</p>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-ink-500">Nothing scheduled.</p>
              ) : (
                <div className="space-y-2.5">
                  {upcomingEvents.map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-300">{e.title}</span>
                      <span className="text-xs text-ink-500">
                        {new Date(e.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <NotesPanel />
        </div>
      </div>
    </div>
  );
}
