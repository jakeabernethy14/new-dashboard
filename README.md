# My Dashboard

A dark, red-accented dashboard for a video editing business: login, KPIs, clients,
invoices, an outgoing-services (subscription) tracker, notes, earnings, and a full
calendar. Built with Next.js (App Router) + Tailwind CSS + Supabase.

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
   This creates the tables — `clients`, `invoices`, `services`, `notes`,
   `calendar_events`, `app_settings` — and locks each one down with Row Level Security
   so only you (once logged in) can ever see or edit your rows.
2. Go to **Project Settings → API** and copy your **Project URL** and **anon public /
   publishable key**.
3. Copy `.env.local.example` to `.env.local` and paste those two values in:

   ```bash
   cp .env.local.example .env.local
   ```

4. Restart `npm run dev`. The login page will now do real sign-up/sign-in, and every
   page (clients, invoices, services, notes, calendar, earnings, settings) reads and
   writes straight to your Supabase database instead of demo data.
5. By default Supabase requires email confirmation for new accounts — you'll get a
   confirmation email before you can sign in. This is a Supabase project-level setting
   that the app's public key isn't allowed to change (that's a deliberate security
   boundary), so turn it off directly in your Supabase dashboard under
   **Authentication → Providers → Email → Confirm email** if you don't want it while
   testing.

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
4. Deploy. That's it — Next.js projects need no extra Vercel config.

If you ever rotate your Supabase anon key, update it in Vercel's Environment Variables
and redeploy (or just click **Redeploy** — no code changes needed).

## What's included

| Area | What it does |
|---|---|
| **Login** | Email/password auth via Supabase Auth, with a "Remember me" toggle (controls whether the session survives closing the browser) and sign-up that can be turned off from Settings |
| **Dashboard** | KPIs (total revenue, monthly expenses, total clients), a 6-month revenue chart, mini calendar, quick notes, invoices needing attention, upcoming events |
| **Clients** | Table view — name, email, description — with inline edit/delete |
| **Invoices** | Filterable table, color-coded by status (paid = green, sent = amber, overdue = red, draft = gray), inline status changes, one-click PDF download per invoice, add/delete |
| **Outgoing services** | Table of what you pay for (software, storage, stock libraries, etc.), monthly + annualized spend totals, billing cycle and next charge date |
| **Earnings** | Weekly / monthly / yearly breakdown of paid invoice revenue, with a chart and a table |
| **Notes** | Quick capture with pinning, shown on the dashboard |
| **Calendar** | Full month view with shoot / edit / deadline / meeting / other event types, day detail panel, add/delete events |
| **Settings** | Toggle whether new accounts can sign up, and switch between dark/light theme |

## Project structure

```
app/
  page.tsx                 → login
  auth/callback/route.ts   → email confirmation redirect
  (dashboard)/
    layout.tsx              → sidebar + mobile nav shell
    dashboard/page.tsx       → KPIs, chart, mini calendar, notes
    clients/page.tsx
    invoices/page.tsx
    services/page.tsx
    earnings/page.tsx
    calendar/page.tsx
    settings/page.tsx
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

Near-black base with a bright, saturated red accent (`#ff2438`), Space Grotesk for
headings/numbers and Inter for body text. A light theme is available from Settings,
using a darker version of the same red accent on a bright background — the toggle
switches instantly since every color is a runtime CSS variable, not baked in at build
time, so no page reload or rebuild is needed.

## Extending it

- **Line items on invoices**: the schema keeps invoices as a single amount for
  simplicity. If you want itemized invoices, add an `invoice_items` table
  (`invoice_id`, `description`, `quantity`, `rate`) and a small line-item editor.
- **Team accounts**: right now every studio has a single Supabase Auth login. Adding
  multiple real logins with different permission levels needs Supabase's service_role
  key running in a server-side function — never in the browser — since it can bypass
  all security rules. Happy to build that when you're ready for it.
- **File uploads for deliverables**: Supabase Storage plugs in easily for attaching
  final video links or proofs to a client or invoice record.
