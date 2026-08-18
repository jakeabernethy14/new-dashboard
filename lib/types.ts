export type ClientStatus = "active" | "past" | "lead";

export type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type Invoice = {
  id: string;
  client_id: string;
  invoice_number: string;
  description: string | null;
  amount: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  created_at: string;
};

export type BillingCycle = "monthly" | "yearly" | "one-time";

export type Service = {
  id: string;
  name: string;
  category: string | null;
  cost: number;
  billing_cycle: BillingCycle;
  next_billing_date: string | null;
  status: "active" | "paused" | "cancelled";
  url: string | null;
  notes: string | null;
};

export type Note = {
  id: string;
  content: string;
  pinned: boolean;
  created_at: string;
};

export type EventType = "shoot" | "edit" | "deadline" | "meeting" | "other";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_time: string;
  end_time: string | null;
  client_id: string | null;
};
