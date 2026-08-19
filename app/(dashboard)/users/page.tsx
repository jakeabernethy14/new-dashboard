"use client";

import { useState } from "react";
import { Plus, Trash2, Shield } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
import { mockTeamMembers } from "@/lib/mock-data";
import type { TeamMember, TeamRole } from "@/lib/types";

const inputClass =
  "w-full rounded-lg bg-base-850 border border-line px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors";

const ROLE_STYLE: Record<TeamRole, string> = {
  admin: "bg-bright-500/10 text-bright-300 border-bright-500/25",
  editor: "bg-mint-400/10 text-mint-400 border-mint-400/25",
  viewer: "bg-ink-700/10 text-ink-500 border-line",
};

export default function UsersPage() {
  const { data: members, loading, addItem, updateItem, deleteItem } = useSupabaseTable<TeamMember>(
    "team_members",
    mockTeamMembers,
    { orderColumn: "invited_at" }
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "editor" as TeamRole });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addItem({ ...form, invited_at: new Date().toISOString() } as Partial<TeamMember>);
    setForm({ name: "", email: "", role: "editor" });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="People with access to this studio dashboard"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 text-sm font-semibold px-3.5 py-2 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add user
          </button>
        }
      />

      <div className="px-6 md:px-8 pb-10">
        <div className="rounded-lg border border-bright-500/20 bg-bright-500/5 px-4 py-3 mb-6 flex items-start gap-2.5">
          <Shield className="h-4 w-4 text-bright-400 mt-0.5 shrink-0" />
          <p className="text-xs text-ink-300 leading-relaxed">
            This list tracks who you consider part of the studio and their intended access level.
            It doesn&apos;t yet create real login accounts for them — for that, each person would sign
            up on the login page themselves (or you'd invite them via Supabase Auth directly). Ask me
            to wire up real invite emails via a Supabase Edge Function whenever you're ready for that.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-ink-500">Loading…</p>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line py-16 text-center text-sm text-ink-500">
            No users added yet.
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-base-900/60 overflow-hidden overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium text-ink-700">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="group border-b border-line last:border-0 hover:bg-base-850/50 transition-colors">
                    <td className="px-5 py-3.5 text-ink-100 font-medium">{m.name}</td>
                    <td className="px-5 py-3.5 text-ink-300">{m.email}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={m.role}
                        onChange={(e) => updateItem(m.id, { role: e.target.value as TeamRole })}
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize bg-transparent cursor-pointer outline-none ${ROLE_STYLE[m.role]}`}
                      >
                        <option value="admin" className="bg-base-900">admin</option>
                        <option value="editor" className="bg-base-900">editor</option>
                        <option value="viewer" className="bg-base-900">viewer</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => deleteItem(m.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-md text-ink-500 hover:text-coral-400 hover:bg-coral-400/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal title="Add user" onClose={() => setOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              required
              placeholder="Full name"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <select
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as TeamRole })}
            >
              <option value="admin">Admin — full access</option>
              <option value="editor">Editor — can manage clients & invoices</option>
              <option value="viewer">Viewer — read only</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 font-semibold text-sm py-2.5 transition-colors cursor-pointer"
            >
              Add user
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
