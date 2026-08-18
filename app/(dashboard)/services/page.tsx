"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import KpiCard from "@/components/KpiCard";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
import { mockServices } from "@/lib/mock-data";
import type { Service, BillingCycle } from "@/lib/types";
import { Wallet, TrendingUp } from "lucide-react";

const inputClass =
  "w-full rounded-lg bg-base-850 border border-line px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

function monthlyEquivalent(s: Service) {
  if (s.status !== "active") return 0;
  if (s.billing_cycle === "monthly") return s.cost;
  if (s.billing_cycle === "yearly") return s.cost / 12;
  return 0;
}

export default function ServicesPage() {
  const { data: services, loading, addItem, deleteItem, updateItem } = useSupabaseTable<Service>(
    "services",
    mockServices,
    { orderColumn: "next_billing_date" }
  );
  const [open, setOpen] = useState(false);

  const monthlyTotal = useMemo(
    () => services.reduce((sum, s) => sum + monthlyEquivalent(s), 0),
    [services]
  );
  const yearlyTotal = monthlyTotal * 12;

  const [form, setForm] = useState({
    name: "",
    category: "",
    cost: "",
    billing_cycle: "monthly" as BillingCycle,
    next_billing_date: "",
    status: "active" as Service["status"],
    url: "",
    notes: "",
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addItem({ ...form, cost: parseFloat(form.cost || "0") } as Partial<Service>);
    setForm({
      name: "",
      category: "",
      cost: "",
      billing_cycle: "monthly",
      next_billing_date: "",
      status: "active",
      url: "",
      notes: "",
    });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Outgoing services"
        subtitle="Software, storage, stock libraries and other tools you pay for"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 text-sm font-semibold px-3.5 py-2 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add service
          </button>
        }
      />

      <div className="px-6 md:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-xl">
          <KpiCard label="Monthly spend" value={currency(monthlyTotal)} icon={Wallet} accent="amber" />
          <KpiCard label="Annualized spend" value={currency(yearlyTotal)} icon={TrendingUp} accent="coral" />
        </div>

        {loading ? (
          <p className="text-sm text-ink-500">Loading…</p>
        ) : services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line py-16 text-center text-sm text-ink-500">
            No services tracked yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div
                key={s.id}
                className="group relative rounded-xl border border-line bg-base-900/60 p-5 hover:border-bright-500/30 transition-colors"
              >
                <button
                  onClick={() => deleteItem(s.id)}
                  className="absolute top-4 right-4 h-6 w-6 flex items-center justify-center rounded-md text-ink-700 hover:text-coral-400 hover:bg-coral-400/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <p className="font-medium text-ink-100 flex items-center gap-1.5">
                      {s.name}
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-ink-700 hover:text-bright-400">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </p>
                    {s.category && <p className="text-xs text-ink-500 mt-0.5">{s.category}</p>}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={s.status}
                    onChange={(e) => updateItem(s.id, { status: e.target.value as Service["status"] })}
                    className="bg-transparent outline-none cursor-pointer"
                  >
                    <option value="active" className="bg-base-900">active</option>
                    <option value="paused" className="bg-base-900">paused</option>
                    <option value="cancelled" className="bg-base-900">cancelled</option>
                  </select>
                </div>
                <div className="mt-1">
                  <StatusBadge status={s.status} />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-mono text-lg text-ink-100">{currency(s.cost)}</span>
                  <span className="text-xs text-ink-500">/{s.billing_cycle === "one-time" ? "one-time" : s.billing_cycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                {s.next_billing_date && (
                  <p className="text-xs text-ink-500 mt-1">
                    Next charge {new Date(s.next_billing_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                )}
                {s.notes && <p className="mt-3 text-xs text-ink-500 border-t border-line pt-3">{s.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <Modal title="Add outgoing service" onClose={() => setOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              required
              placeholder="Service name (e.g. Adobe Creative Cloud)"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Category (e.g. Editing software)"
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="Cost ($)"
                className={inputClass}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              />
              <select
                className={inputClass}
                value={form.billing_cycle}
                onChange={(e) => setForm({ ...form, billing_cycle: e.target.value as BillingCycle })}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-ink-500 mb-1">Next billing date</label>
              <input
                type="date"
                className={inputClass}
                value={form.next_billing_date}
                onChange={(e) => setForm({ ...form, next_billing_date: e.target.value })}
              />
            </div>
            <input
              placeholder="Website URL (optional)"
              className={inputClass}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
            <textarea
              placeholder="Notes"
              rows={2}
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 font-semibold text-sm py-2.5 transition-colors cursor-pointer"
            >
              Add service
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
