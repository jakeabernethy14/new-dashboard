"use client";

import Link from "next/link";
import type { CalendarEvent } from "@/lib/types";

const EVENT_DOT: Record<string, string> = {
  shoot: "bg-bright-400",
  edit: "bg-mint-400",
  deadline: "bg-coral-400",
  meeting: "bg-amber-400",
  other: "bg-ink-500",
};

export default function MiniCalendar({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = new Map<number, CalendarEvent[]>();
  events.forEach((e) => {
    const d = new Date(e.start_time);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      eventsByDay.set(day, [...(eventsByDay.get(day) ?? []), e]);
    }
  });

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-xl border border-line bg-base-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-sm text-ink-100">
          {firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <Link
          href="/calendar"
          className="text-xs text-bright-400 hover:text-bright-300 underline underline-offset-4 decoration-line"
        >
          Full calendar
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[10px] text-ink-700 font-medium py-1">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          const isToday = day === today.getDate();
          const dayEvents = day ? eventsByDay.get(day) ?? [] : [];
          return (
            <div
              key={i}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative ${
                day
                  ? isToday
                    ? "bg-bright-500 text-base-950 font-semibold"
                    : "text-ink-300 hover:bg-base-850"
                  : ""
              }`}
            >
              {day}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 absolute bottom-1">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`h-1 w-1 rounded-full ${isToday ? "bg-base-950" : EVENT_DOT[e.event_type]}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
