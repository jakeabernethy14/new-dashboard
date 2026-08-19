"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
import { mockClients, mockInvoices } from "@/lib/mock-data";
import { downloadInvoicePdf } from "@/lib/generateInvoicePdf";
import type { Client, Invoice, InvoiceStatus } from "@/lib/types";

const inputClass =
  "w-full rounded-lg bg-base-850 border border-line px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const STATUS_SELECT_STYLE: Record<InvoiceStatus, string> = {
  paid: "border-mint-400/30 text-mint-400",
  sent: "border-amber-400/30 text-amber-400",
  overdue: "border-coral-400/30 text-coral-400",
  draft: "border-line text-ink-500",
};

export default function InvoicesPage() {
  const { data: clients } = useSupabaseTable<Client>("clients", mockClients);
  const { data: invoices, loading, addItem, updateItem, deleteItem } = useSupabaseTable<Invoice>(
    "invoices",
    mockInvoices,
    { orderColumn: "issue_date" }
  );
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "Unknown client";

  const filtered = useMemo(
    () => (filter === "all" ? invoices : invoices.filter((i) => i.status === filter)),
    [invoices, filter]
  );

  const totalOutstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  const [form, setForm] = useState({
    client_id: "",
    invoice_number: "",
    description: "",
    amount: "",
    status: "draft" as InvoiceStatus,
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: "",
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id) return;
    await addItem({
      ...form,
      amount: parseFloat(form.amount || "0"),
      invoice_number: form.invoice_number || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    } as Partial<Invoice>);
    setForm({
      client_id: "",
      invoice_number: "",
      description: "",
      amount: "",
      status: "draft",
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: "",
    });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${currency(totalOutstanding)} outstanding across ${invoices.filter((i) => i.status !== "paid" && i.status !== "draft").length} invoices`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 text-sm font-semibold px-3.5 py-2 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New invoice
          </button>
        }
      />

      <div className="px-6 md:px-8 pb-10">
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin">
          {(["all", "draft", "sent", "paid", "overdue"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer border ${
                filter === f
                  ? "bg-bright-500/10 text-bright-300 border-bright-500/25"
                  : "text-ink-500 border-line hover:text-ink-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-ink-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line py-16 text-center text-sm text-ink-500">
            No invoices in this view.
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-base-900/60 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_1.4fr_0.9fr_0.9fr_0.9fr_auto] gap-3 px-5 py-3 text-xs font-medium text-ink-700 border-b border-line">
              <span>Invoice</span>
              <span>Client / description</span>
              <span>Amount</span>
              <span>Due</span>
              <span>Status</span>
              <span></span>
            </div>
            {filtered.map((inv) => {
              const client = clients.find((c) => c.id === inv.client_id);
              const statusBorder = {
                paid: "border-l-mint-400",
                sent: "border-l-amber-400",
                overdue: "border-l-coral-400",
                draft: "border-l-line",
              }[inv.status];
              return (
                <div
                  key={inv.id}
                  className={`grid grid-cols-2 sm:grid-cols-[1fr_1.4fr_0.9fr_0.9fr_0.9fr_auto] gap-3 px-5 py-4 text-sm border-b border-l-2 border-line last:border-b-0 items-center ${statusBorder}`}
                >
                  <span className="font-mono text-ink-300 text-xs">{inv.invoice_number}</span>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-ink-100">{clientName(inv.client_id)}</p>
                    {inv.description && (
                      <p className="text-xs text-ink-500 mt-0.5 line-clamp-1">{inv.description}</p>
                    )}
                  </div>
                  <span className="font-mono text-ink-100 tabular-nums">{currency(inv.amount)}</span>
                  <span className="text-xs text-ink-500">
                    {new Date(inv.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <select
                    value={inv.status}
                    onChange={(e) => updateItem(inv.id, { status: e.target.value as InvoiceStatus })}
                    className={`w-fit rounded-full border px-2.5 py-1 text-xs font-medium capitalize bg-transparent cursor-pointer outline-none ${STATUS_SELECT_STYLE[inv.status]}`}
                  >
                    {["draft", "sent", "paid", "overdue"].map((s) => (
                      <option key={s} value={s} className="bg-base-900 text-ink-100">
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1 justify-self-end">
                    <button
                      onClick={() => downloadInvoicePdf(inv, client)}
                      title="Download PDF"
                      className="h-7 w-7 flex items-center justify-center rounded-md text-ink-500 hover:text-bright-400 hover:bg-bright-500/10 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteItem(inv.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-ink-700 hover:text-coral-400 hover:bg-coral-400/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="sm:hidden col-span-2">
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <Modal title="New invoice" onClose={() => setOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-3">
            <select
              required
              className={inputClass}
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            >
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Description (e.g. June reels package)"
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="Amount ($)"
                className={inputClass}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <input
                placeholder="Invoice # (auto if blank)"
                className={inputClass}
                value={form.invoice_number}
                onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-ink-500 mb-1">Issue date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-ink-500 mb-1">Due date</label>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </div>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 font-semibold text-sm py-2.5 transition-colors cursor-pointer"
            >
              Create invoice
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
