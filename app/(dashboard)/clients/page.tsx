"use client";

import { useState } from "react";
import { Plus, Mail, Phone, Building2, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
import { mockClients } from "@/lib/mock-data";
import type { Client, ClientStatus } from "@/lib/types";

const inputClass =
  "w-full rounded-lg bg-base-850 border border-line px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors";

export default function ClientsPage() {
  const { data: clients, loading, addItem, deleteItem } = useSupabaseTable<Client>(
    "clients",
    mockClients,
    { orderColumn: "created_at" }
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "lead" as ClientStatus,
    notes: "",
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addItem({
      ...form,
      created_at: new Date().toISOString().slice(0, 10),
    } as Partial<Client>);
    setForm({ name: "", company: "", email: "", phone: "", status: "lead", notes: "" });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} total · ${clients.filter((c) => c.status === "active").length} active`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 text-sm font-semibold px-3.5 py-2 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New client
          </button>
        }
      />

      <div className="px-6 md:px-8 pb-10">
        {loading ? (
          <p className="text-sm text-ink-500">Loading…</p>
        ) : clients.length === 0 ? (
          <EmptyState onAdd={() => setOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="group relative rounded-xl border border-line bg-base-900/60 p-5 hover:border-bright-500/30 transition-colors"
              >
                <button
                  onClick={() => deleteItem(client.id)}
                  className="absolute top-4 right-4 h-6 w-6 flex items-center justify-center rounded-md text-ink-700 hover:text-coral-400 hover:bg-coral-400/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <p className="font-medium text-ink-100">{client.name}</p>
                    {client.company && (
                      <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" /> {client.company}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <StatusBadge status={client.status} />
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-ink-500">
                  {client.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {client.phone}
                    </p>
                  )}
                </div>
                {client.notes && (
                  <p className="mt-3 text-xs text-ink-500 border-t border-line pt-3 leading-relaxed">
                    {client.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <Modal title="New client" onClose={() => setOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              required
              placeholder="Client name"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Company (optional)"
              className={inputClass}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                placeholder="Phone"
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}
            >
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="past">Past</option>
            </select>
            <textarea
              placeholder="Notes"
              rows={3}
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 font-semibold text-sm py-2.5 transition-colors cursor-pointer"
            >
              Add client
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-line py-16 flex flex-col items-center text-center">
      <p className="text-sm text-ink-500 mb-3">No clients yet.</p>
      <button
        onClick={onAdd}
        className="text-sm text-bright-400 hover:text-bright-300 underline underline-offset-4 decoration-line cursor-pointer"
      >
        Add your first client
      </button>
    </div>
  );
}
