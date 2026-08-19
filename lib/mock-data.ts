import type { Client, Invoice, Service, Note, CalendarEvent, TeamMember } from "./types";

const today = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};
const dateOnly = (offsetDays: number) => iso(offsetDays).slice(0, 10);

export const mockClients: Client[] = [
  { id: "c1", name: "Maya Chen", company: "Northline Films", email: "maya@northlinefilms.co", phone: "555-0114", description: "Prefers Premiere project files, quick turnarounds.", created_at: dateOnly(-120) },
  { id: "c2", name: "Diego Reyes", company: "Reyes Real Estate", email: "diego@reyesrealty.com", phone: "555-0128", description: "Monthly property walkthrough edits.", created_at: dateOnly(-90) },
  { id: "c3", name: "Priya Anand", company: "Anand Fitness Studio", email: "priya@anandfit.com", phone: "555-0142", description: "Weekly reels, needs captions burned in.", created_at: dateOnly(-60) },
  { id: "c4", name: "Jordan Blake", company: "Blake Weddings", email: "jordan@blakeweddings.com", phone: "555-0157", description: "One-off wedding highlight reel, delivered.", created_at: dateOnly(-200) },
  { id: "c5", name: "Sam Okafor", company: "Okafor Music", email: "sam@okaformusic.com", phone: "555-0163", description: "Discussing a music video package for Q3.", created_at: dateOnly(-5) },
];

export const mockTeamMembers: TeamMember[] = [
  { id: "t1", name: "Jake Abernethy", email: "jake@studio.com", role: "admin", invited_at: dateOnly(-300) },
  { id: "t2", name: "Alex Rivera", email: "alex@studio.com", role: "editor", invited_at: dateOnly(-40) },
];

export const mockInvoices: Invoice[] = [
  { id: "i1", client_id: "c1", invoice_number: "INV-1042", description: "Brand documentary — final cut + color", amount: 3200, status: "paid", issue_date: dateOnly(-30), due_date: dateOnly(-16), created_at: dateOnly(-30) },
  { id: "i2", client_id: "c2", invoice_number: "INV-1043", description: "May property walkthroughs (4 listings)", amount: 950, status: "paid", issue_date: dateOnly(-24), due_date: dateOnly(-10), created_at: dateOnly(-24) },
  { id: "i3", client_id: "c3", invoice_number: "INV-1044", description: "June reels package (8 videos)", amount: 1400, status: "sent", issue_date: dateOnly(-6), due_date: dateOnly(8), created_at: dateOnly(-6) },
  { id: "i4", client_id: "c1", invoice_number: "INV-1045", description: "Additional social cutdowns", amount: 600, status: "overdue", issue_date: dateOnly(-20), due_date: dateOnly(-3), created_at: dateOnly(-20) },
  { id: "i5", client_id: "c4", invoice_number: "INV-1046", description: "Wedding highlight reel", amount: 1800, status: "paid", issue_date: dateOnly(-80), due_date: dateOnly(-66), created_at: dateOnly(-80) },
  { id: "i6", client_id: "c2", invoice_number: "INV-1047", description: "June property walkthroughs", amount: 950, status: "draft", issue_date: dateOnly(0), due_date: dateOnly(14), created_at: dateOnly(0) },
];

export const mockServices: Service[] = [
  { id: "s1", name: "Adobe Creative Cloud", category: "Editing software", cost: 62.99, billing_cycle: "monthly", next_billing_date: dateOnly(9), status: "active", url: "https://adobe.com", notes: "Premiere, After Effects, Photoshop" },
  { id: "s2", name: "Frame.io", category: "Client review", cost: 25, billing_cycle: "monthly", next_billing_date: dateOnly(4), status: "active", url: "https://frame.io", notes: null },
  { id: "s3", name: "Epidemic Sound", category: "Music licensing", cost: 21.99, billing_cycle: "monthly", next_billing_date: dateOnly(17), status: "active", url: "https://epidemicsound.com", notes: null },
  { id: "s4", name: "Storyblocks", category: "Stock footage", cost: 299, billing_cycle: "yearly", next_billing_date: dateOnly(140), status: "active", url: "https://storyblocks.com", notes: null },
  { id: "s5", name: "Backblaze B2 storage", category: "Backup / storage", cost: 18.5, billing_cycle: "monthly", next_billing_date: dateOnly(12), status: "active", url: "https://backblaze.com", notes: "Project archive backups" },
  { id: "s6", name: "Squarespace", category: "Portfolio site", cost: 216, billing_cycle: "yearly", next_billing_date: dateOnly(210), status: "paused", url: null, notes: "Considering cancelling, low traffic" },
];

export const mockNotes: Note[] = [
  { id: "n1", content: "Follow up with Sam Okafor about music video budget — send package options by Friday.", pinned: true, created_at: dateOnly(-1) },
  { id: "n2", content: "Northline Films wants a 30s teaser cut before the full documentary delivery.", pinned: true, created_at: dateOnly(-3) },
  { id: "n3", content: "Renew LUTs pack license before it expires end of month.", pinned: false, created_at: dateOnly(-7) },
  { id: "n4", content: "Ask Priya if she wants vertical + square exports bundled going forward.", pinned: false, created_at: dateOnly(-2) },
];

export const mockEvents: CalendarEvent[] = [
  { id: "e1", title: "Shoot — Reyes Realty listing", description: "123 Maple St walkthrough", event_type: "shoot", start_time: iso(1), end_time: iso(1), client_id: "c2" },
  { id: "e2", title: "Deliver: Anand Fitness reels", description: "8 reels due", event_type: "deadline", start_time: iso(2), end_time: null, client_id: "c3" },
  { id: "e3", title: "Client call — Sam Okafor", description: "Discuss music video scope", event_type: "meeting", start_time: iso(3), end_time: iso(3), client_id: "c5" },
  { id: "e4", title: "Edit block — Northline documentary", description: "Color pass", event_type: "edit", start_time: iso(5), end_time: iso(5), client_id: "c1" },
  { id: "e5", title: "Invoice due — INV-1044", description: "Anand Fitness Studio", event_type: "deadline", start_time: iso(8), end_time: null, client_id: "c3" },
  { id: "e6", title: "Shoot — Reyes Realty listing #2", description: "88 Birchwood Ave", event_type: "shoot", start_time: iso(11), end_time: iso(11), client_id: "c2" },
];
