# Reel Ops — Studio Dashboard

A dark navy / bright blue dashboard for a video editing business: login, KPIs, clients,
invoices, an outgoing-services (subscription) tracker, notes, and a full calendar.
Built with Next.js (App Router) + Tailwind CSS + Supabase.

**The app works right now with demo data**, before you connect anything — run it locally
or deploy it and click "Preview dashboard with demo data" on the login screen. Once you
add your Supabase keys, it automatically switches to your real, private data.

## 1. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on the login page. Click **"Preview dashboard
with demo data"** to look around without setting anything up.

## 2. Connect your Supabase database

1. In your Supabase project, go to **SQL Editor → New query**, paste in the entire
   contents of [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
   This creates five tables — `clients`, `invoices`, `services`, `notes`,
   `calendar_events` — and locks each one down with Row Level Security so only you
   (once logged in) can ever see or edit your rows.
2. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
3. Copy `.env.local.example` to `.env.local` and paste those two values in:

   ```bash
   cp .env.local.example .env.local
   ```

4. Restart `npm run dev`. The login page will now do real sign-up/sign-in, and every
   page (clients, invoices, services, notes, calendar, earnings, users, settings) reads
   and writes straight to your Supabase database instead of demo data.
5. By default Supabase requires email confirmation for new accounts — you'll get a
   confirmation email before you can sign in. You can turn this off for yourself in
   **Authentication → Providers → Email → Confirm email** while testing, or from the
   in-app **Settings** page (it links straight there, since this is a Supabase
   project-level setting the app itself can't flip for security reasons).

### Turning on the AI Assistant tab
The Assistant tab talks to Claude via a small server-side API route, so it needs its
own key (kept secret on the server, never exposed to the browser):

1. Get an API key from [console.anthropic.com](https://console.anthropic.com).
2. Add it to `.env.local` (and later to Vercel's Environment Variables):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Restart the dev server. The Assistant tab will now respond instead of showing a
   "not configured" message.

### Adding more tables/columns later
`supabase/schema.sql` is safe to extend — add new `alter table` or `create table`
statements at the bottom and re-run the file in the SQL Editor. It won't duplicate or
break existing tables.

## 3. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel: **Add New → Project**, import the repo.
3. Under **Environment Variables**, add the keys from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (only needed if you want the AI Assistant tab working)
4. Deploy. That's it — Next.js projects need no extra Vercel config.

If you ever rotate your Supabase anon key, update it in Vercel's Environment Variables
and redeploy (or just click **Redeploy** — no code changes needed).

## What's included

| Area | What it does |
|---|---|
| **Login** | Email/password auth via Supabase Auth, with a "Remember me" toggle (controls whether the session survives closing the browser) and sign-up that can be turned off from Settings |
| **Dashboard** | KPIs (total revenue, monthly expenses, total clients), a 6-month revenue chart, mini calendar, quick notes, invoices needing attention, upcoming events |
| **Clients** | Table view — name, email, description — with inline edit/delete |
| **Invoices** | Filterable table, color-coded by status (paid = green, sent = blue, overdue = red, draft = gray), inline status changes, one-click PDF download per invoice, add/delete |
| **Outgoing services** | Table of what you pay for (software, storage, stock libraries, etc.), monthly + annualized spend totals, billing cycle and next charge date |
| **Earnings** | Weekly / monthly / yearly breakdown of paid invoice revenue, with a chart and a table |
| **Notes** | Quick capture with pinning, shown on the dashboard |
| **Calendar** | Full month view with shoot / edit / deadline / meeting / other event types, day detail panel, add/delete events |
| **Users** | Add/edit-role/delete a team list (see note below on what this does and doesn't do) |
| **Settings** | Toggle whether new accounts can sign up, link to Supabase's email-confirmation setting, light/dark theme switch |
| **AI Assistant** | Chat-style helper (backed by Claude) with quick actions for invoice reminders, client follow-ups, content ideas, and project briefs |

### A note on the Users tab
It manages a simple list of people you consider part of the studio and their intended
access level — it does **not** create real Supabase Auth login accounts for them. Real
account creation happens when someone signs up on the login page themselves. If you want
proper admin-driven invites (create a real login for someone without them signing up),
that requires Supabase's service_role key running in a server-side function — never in
the browser — since it can bypass all security rules. Happy to build that as a next step
if you need it.

### A note on email confirmation
Supabase enforces this at the project level using settings the public/anon key isn't
allowed to change (that's intentional — it's a security boundary). The Settings page
links straight to the right spot in your Supabase dashboard to turn it off.

## Project structure

```
app/
  page.tsx                 → login
  api/agent/route.ts       → server route that calls Claude for the AI Assistant tab
  auth/callback/route.ts   → email confirmation redirect
  (dashboard)/
    layout.tsx              → sidebar + mobile nav shell
    dashboard/page.tsx       → KPIs, chart, mini calendar, notes
    clients/page.tsx
    invoices/page.tsx
    services/page.tsx
    earnings/page.tsx
    calendar/page.tsx
    users/page.tsx
    settings/page.tsx
    agent/page.tsx
components/                → Sidebar, KpiCard, StatusBadge, Modal, MiniCalendar, NotesPanel, ThemeScript...
lib/
  types.ts                  → shared TypeScript types (mirrors the SQL schema)
  mock-data.ts               → demo data used until Supabase is connected
  useSupabaseTable.ts         → generic fetch/insert/update/delete hook per table
  useAppSettings.ts            → hook for the Settings page's saved preferences
  ThemeProvider.tsx            → light/dark theme context
  generateInvoicePdf.ts         → builds the downloadable invoice PDF
  supabase/                  → browser + server Supabase clients, session middleware
supabase/schema.sql          → run this once in the Supabase SQL Editor
proxy.ts                     → refreshes the auth session and protects dashboard routes
```

## Notes on the design

Dark navy base (`#050b16` → `#17304f`) with a bright, saturated electric-blue accent
(`#00c2ff`), Space Grotesk for headings/numbers and Inter for body text. A light theme
is available from Settings, using the same accent colors on a bright background.

## Extending it

- **Line items on invoices**: the schema keeps invoices as a single amount for
  simplicity. If you want itemized invoices, add an `invoice_items` table
  (`invoice_id`, `description`, `quantity`, `rate`) and a small line-item editor.
- **PDF invoices / emailing clients**: wire up a service like Resend or a Supabase Edge
  Function once you're ready.
- **File uploads for deliverables**: Supabase Storage plugs in easily for attaching
  final video links or proofs to a client or invoice record.
