"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { useSupabaseTable } from "@/lib/useSupabaseTable";
import { mockClients, mockEvents } from "@/lib/mock-data";
import type { CalendarEvent, EventType, Client } from "@/lib/types";

const inputClass =
  "w-full rounded-lg bg-base-850 border border-line px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors";

const EVENT_STYLE: Record<EventType, string> = {
  shoot: "bg-bright-500/15 text-bright-300 border-bright-500/25",
  edit: "bg-mint-400/15 text-mint-400 border-mint-400/25",
  deadline: "bg-coral-400/15 text-coral-400 border-coral-400/25",
  meeting: "bg-amber-400/15 text-amber-400 border-amber-400/25",
  other: "bg-ink-700/15 text-ink-500 border-line",
};

const EVENT_DOT: Record<EventType, string> = {
  shoot: "bg-bright-400",
  edit: "bg-mint-400",
  deadline: "bg-coral-400",
  meeting: "bg-amber-400",
  other: "bg-ink-500",
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const { data: events, addItem, deleteItem } = useSupabaseTable<CalendarEvent>(
    "calendar_events",
    mockEvents,
    { orderColumn: "start_time", ascending: true }
  );
  const { data: clients } = useSupabaseTable<Client>("clients", mockClients);

  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    events.forEach((e) => {
      const d = new Date(e.start_time);
      if (d.getFullYear() === year && d.getMonth() === month) {
        map.set(d.getDate(), [...(map.get(d.getDate()) ?? []), e]);
      }
    });
    return map;
  }, [events, year, month]);

  const selectedEvents = events
    .filter((e) => sameDay(new Date(e.start_time), selected))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "shoot" as EventType,
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    client_id: "",
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const start = new Date(`${form.date}T${form.time || "09:00"}`);
    await addItem({
      title: form.title,
      description: form.description || null,
      event_type: form.event_type,
      start_time: start.toISOString(),
      end_time: null,
      client_id: form.client_id || null,
    } as Partial<CalendarEvent>);
    setSelected(start);
    setCursor(start);
    setForm({ title: "", description: "", event_type: "shoot", date: form.date, time: "09:00", client_id: "" });
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Shoots, edit blocks, deadlines and client meetings."
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 text-sm font-semibold px-3.5 py-2 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New event
          </button>
        }
      />

      <div className="px-6 md:px-8 pb-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="rounded-xl border border-line bg-base-900/60 p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="font-display text-lg text-ink-100">
              {firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-line text-ink-500 hover:text-ink-100 hover:bg-base-850 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCursor(new Date())}
                className="px-3 h-8 flex items-center justify-center rounded-lg border border-line text-xs text-ink-500 hover:text-ink-100 hover:bg-base-850 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-line text-ink-500 hover:text-ink-100 hover:bg-base-850 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d} className="text-[11px] text-ink-700 font-medium py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const date = new Date(year, month, day);
              const isToday = sameDay(date, new Date());
              const isSelected = sameDay(date, selected);
              const dayEvents = eventsByDay.get(day) ?? [];
              return (
                <button
                  key={i}
                  onClick={() => setSelected(date)}
                  className={`aspect-square rounded-lg p-1.5 flex flex-col items-start text-left transition-colors cursor-pointer border ${
                    isSelected
                      ? "border-bright-500 bg-bright-500/10"
                      : "border-transparent hover:bg-base-850"
                  }`}
                >
                  <span
                    className={`text-xs h-5 w-5 flex items-center justify-center rounded-full ${
                      isToday ? "bg-bright-500 text-base-950 font-semibold" : "text-ink-300"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {dayEvents.slice(0, 4).map((e) => (
                      <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${EVENT_DOT[e.event_type]}`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-line">
            {(Object.keys(EVENT_DOT) as EventType[]).map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-ink-500 capitalize">
                <span className={`h-1.5 w-1.5 rounded-full ${EVENT_DOT[t]}`} /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-base-900/60 p-5 h-fit">
          <p className="font-display text-sm text-ink-100 mb-4">
            {selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-ink-500">No events scheduled.</p>
          ) : (
            <div className="space-y-2.5">
              {selectedEvents.map((e) => (
                <div key={e.id} className={`group relative rounded-lg border px-3 py-2.5 ${EVENT_STYLE[e.event_type]}`}>
                  <button
                    onClick={() => deleteItem(e.id)}
                    className="absolute top-2 right-2 h-5 w-5 flex items-center justify-center rounded text-current opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <p className="text-xs font-medium pr-5">{e.title}</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {new Date(e.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                  {e.description && <p className="text-[11px] opacity-70 mt-1">{e.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <Modal title="New event" onClose={() => setOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              required
              placeholder="Event title"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                required
                className={inputClass}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <input
                type="time"
                className={inputClass}
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <select
              className={inputClass}
              value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value as EventType })}
            >
              <option value="shoot">Shoot</option>
              <option value="edit">Edit block</option>
              <option value="deadline">Deadline</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
            <select
              className={inputClass}
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            >
              <option value="">No client (optional)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Notes"
              rows={2}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 font-semibold text-sm py-2.5 transition-colors cursor-pointer"
            >
              Add event
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
