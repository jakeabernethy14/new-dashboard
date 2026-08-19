"use client";

import { useState, useRef, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Sparkles, Send, Loader2, Mail, Lightbulb, FileText, Clock } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const PRESETS = [
  {
    icon: Clock,
    label: "Invoice reminder",
    prompt: "Draft a polite but firm email reminding a client that their invoice is overdue.",
  },
  {
    icon: Mail,
    label: "Client follow-up",
    prompt: "Draft a friendly follow-up email to a client I haven't heard back from about a project quote.",
  },
  {
    icon: Lightbulb,
    label: "Content ideas",
    prompt: "Suggest 5 short-form video content ideas for a small business client in the fitness industry.",
  },
  {
    icon: FileText,
    label: "Project brief",
    prompt: "Write a short project brief template I can fill in and send to new video editing clients.",
  },
];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Couldn't reach the assistant. Check your connection and try again.");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="AI Assistant"
        subtitle="Quick help with client emails, quotes, and content ideas"
      />

      <div className="flex-1 min-h-0 px-6 md:px-8 pb-6 flex flex-col">
        <div className="flex-1 min-h-0 rounded-xl border border-line bg-base-900/60 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="h-11 w-11 rounded-xl bg-bright-500/10 border border-bright-500/25 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5 text-bright-400" />
                </div>
                <p className="text-sm text-ink-300 max-w-sm">
                  Ask for help drafting emails, writing invoice reminders, brainstorming content, or
                  anything else for the studio. Try one of these:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 max-w-md w-full">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.prompt)}
                      className="flex items-center gap-2 rounded-lg border border-line bg-base-850 hover:border-bright-500/40 hover:bg-base-850/80 px-3 py-2.5 text-xs text-ink-300 text-left transition-colors cursor-pointer"
                    >
                      <p.icon className="h-3.5 w-3.5 text-bright-400 shrink-0" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-bright-500 text-base-950 font-medium"
                      : "bg-base-850 text-ink-100 border border-line"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-base-850 border border-line rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-ink-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-coral-400 bg-coral-400/10 border border-coral-400/20 rounded-lg px-3 py-2 max-w-md">
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the assistant anything about the business…"
              className="flex-1 rounded-lg bg-base-850 border border-line px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-bright-500 focus:ring-1 focus:ring-bright-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-bright-500 hover:bg-bright-400 text-base-950 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
