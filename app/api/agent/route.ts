import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful assistant embedded in a video editing studio's business dashboard.
You help the studio owner with day-to-day business tasks: drafting client emails, writing invoice
reminders, brainstorming content ideas, writing project briefs, and general small-business advice for
a freelance/agency video editing business. Keep responses concise, practical, and ready to use or send
with minimal editing. When drafting an email, include a subject line if relevant. Do not invent specific
client names, amounts, or dates unless the user gave them to you — use placeholders like [Client Name]
or [Amount] instead.`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY isn't set. Add it in your Vercel project's Environment Variables (or .env.local for local dev) to turn on the AI assistant.",
      },
      { status: 400 }
    );
  }

  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const messages = [
      ...((history as { role: "user" | "assistant"; content: string }[]) ?? []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `Anthropic API error: ${text}` }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.content
      ?.map((block: { type: string; text?: string }) => (block.type === "text" ? block.text : ""))
      .join("") ?? "";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Something went wrong talking to the AI assistant." }, { status: 500 });
  }
}
