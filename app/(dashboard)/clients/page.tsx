"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
import { mockClients } from "@/lib/mock-data";
import type { Client } from "@/lib/types";

const inputClass =
  "w-full rounded-lg bg-base-850 border border-line px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors";

const emptyForm = { name: "", company: "", email: "", phone: "", description: "" };

export default function ClientsPage() {
  const { data: clients, loading, addItem, updateItem, deleteItem } = useSupabaseTable<Client>(
    "clients",
    mockClients,
    { orderColumn: "created_at" }
  );
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      name: client.name,
      company: client.company ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      description: client.description ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await updateItem(editingId, { ...form } as Partial<Client>);
    } else {
      await addItem({
        ...form,
        created_at: new Date().toISOString().slice(0, 10),
      } as Partial<Client>);
    }
    setOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} total`}
        action={
          <button
            onClick={openAdd}
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
          <div className="rounded-xl border border-dashed border-line py-16 flex flex-col items-center text-center">
            <p className="text-sm text-ink-500 mb-3">No clients yet.</p>
            <button
              onClick={openAdd}
              className="text-sm text-bright-400 hover:text-bright-300 underline underline-offset-4 decoration-line cursor-pointer"
            >
              Add your first client
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-base-900/60 overflow-hidden overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium text-ink-700">
                  <th className="px-5 py-3 font-medium">Client name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium w-20"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="group border-b border-line last:border-0 hover:bg-base-850/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-ink-100 font-medium">{client.name}</p>
                      {client.company && <p className="text-xs text-ink-500 mt-0.5">{client.company}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-ink-300">{client.email || "—"}</td>
                    <td className="px-5 py-3.5 text-ink-500 max-w-xs">
                      <p className="line-clamp-2">{client.description || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(client)}
                          className="h-7 w-7 flex items-center justify-center rounded-md text-ink-500 hover:text-bright-400 hover:bg-bright-500/10 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItem(client.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-md text-ink-500 hover:text-coral-400 hover:bg-coral-400/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal title={editingId ? "Edit client" : "New client"} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
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
            <textarea
              placeholder="Description / notes"
              rows={3}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 font-semibold text-sm py-2.5 transition-colors cursor-pointer"
            >
              {editingId ? "Save changes" : "Add client"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
