import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice, Client } from "./types";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function downloadInvoicePdf(invoice: Invoice, client: Client | undefined, studioName = "My Dashboard") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(studioName, marginX, 60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text("Video editing & production services", marginX, 78);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text("INVOICE", 547, 60, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(invoice.invoice_number, 547, 76, { align: "right" });

  doc.setDrawColor(220);
  doc.line(marginX, 96, 547, 96);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text("Billed to", marginX, 120);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  doc.text(client?.name ?? "Client", marginX, 136);
  if (client?.company) doc.text(client.company, marginX, 150);
  if (client?.email) doc.text(client.email, marginX, client?.company ? 164 : 150);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(20);
  doc.text("Issue date", 380, 120);
  doc.text("Due date", 470, 120);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  doc.text(new Date(invoice.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }), 380, 136);
  doc.text(new Date(invoice.due_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }), 470, 136);

  autoTable(doc, {
    startY: 200,
    margin: { left: marginX, right: 48 },
    head: [["Description", "Amount"]],
    body: [[invoice.description || "Video editing services", currency(invoice.amount)]],
    theme: "plain",
    headStyles: { fillColor: [13, 28, 51], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: 40 },
    styles: { fontSize: 10, cellPadding: 8 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? 240;

  doc.setDrawColor(220);
  doc.line(marginX, finalY + 20, 547, finalY + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text("Total due", 420, finalY + 44);
  doc.text(currency(invoice.amount), 547, finalY + 44, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, marginX, finalY + 44);
  doc.text("Thank you for your business.", marginX, finalY + 90);

  doc.save(`${invoice.invoice_number}.pdf`);
}
