"use client";

import { useState } from "react";
import { Pin, Plus, Trash2 } from "lucide-react";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
import { mockNotes } from "@/lib/mock-data";
import type { Note } from "@/lib/types";

export default function NotesPanel() {
  const { data: notes, loading, addItem, updateItem, deleteItem } = useSupabaseTable<Note>(
    "notes",
    mockNotes,
    { orderColumn: "created_at" }
  );
  const [draft, setDraft] = useState("");

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    await addItem({
      content: draft.trim(),
      pinned: false,
      created_at: new Date().toISOString(),
    } as Partial<Note>);
    setDraft("");
  }

  return (
    <div className="rounded-xl border border-line bg-base-900/60 p-5 flex flex-col h-full">
      <p className="font-display text-sm text-ink-100 mb-4">Notes</p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Jot something down…"
          className="flex-1 rounded-lg bg-base-850 border border-line px-3 py-2 text-xs text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors"
        />
        <button
          type="submit"
          className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </form>

      <div className="space-y-2 overflow-y-auto scrollbar-thin flex-1 max-h-64">
        {loading ? (
          <p className="text-xs text-ink-500">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="text-xs text-ink-500">No notes yet.</p>
        ) : (
          sorted.map((note) => (
            <div
              key={note.id}
              className="group flex items-start gap-2 rounded-lg border border-line bg-base-850/60 px-3 py-2.5"
            >
              <button
                onClick={() => updateItem(note.id, { pinned: !note.pinned })}
                className={`mt-0.5 shrink-0 cursor-pointer ${note.pinned ? "text-amber-400" : "text-ink-700 hover:text-ink-500"}`}
              >
                <Pin className="h-3 w-3" fill={note.pinned ? "currentColor" : "none"} />
              </button>
              <p className="text-xs text-ink-300 leading-relaxed flex-1">{note.content}</p>
              <button
                onClick={() => deleteItem(note.id)}
                className="shrink-0 text-ink-700 hover:text-coral-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
