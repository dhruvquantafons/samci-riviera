import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail, sendSms } from "./integrations";
import { SITE } from "./site";
import { MT_PRIORITY_LABELS, type MtPriority } from "./types";

/**
 * Alerts to the engineering supervisors (everyone whose role holds
 * maintenance.manage): an urgent ticket raised, or a ticket past its
 * resolution target. Sent by email and SMS when those are configured, and
 * logged in notifications either way. The maintenance board and dashboard
 * show the same alerts in the app.
 */

export interface TicketForAlert {
  id: string;
  reference: string;
  title: string;
  priority: MtPriority;
  due_at: string;
  location?: string;
  rooms?: { room_number: string } | null;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function supervisors(db: SupabaseClient) {
  const { data: roles } = await db.from("role_permissions").select("role_key").eq("permission", "maintenance.manage");
  const keys = [...new Set((roles ?? []).map((r) => r.role_key as string))];
  if (keys.length === 0) return [];
  const { data } = await db.from("staff").select("id, email, phone, full_name").in("role", keys).eq("is_active", true);
  return (data ?? []) as { id: string; email: string; phone: string; full_name: string }[];
}

export async function alertSupervisors(
  db: SupabaseClient,
  ticket: TicketForAlert,
  reason: "urgent" | "escalated",
  staffId: string | null = null,
) {
  const where = ticket.rooms?.room_number ? `Room ${ticket.rooms.room_number}` : ticket.location || "";
  const head =
    reason === "urgent"
      ? `URGENT maintenance ticket ${ticket.reference}`
      : `${ticket.reference} is past its resolution target`;
  const subject = `${head}: ${ticket.title}${where ? ` (${where})` : ""}`;
  const link = `${SITE.url}/admin/maintenance/${ticket.id}`;
  const due = new Date(ticket.due_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const text = [
    subject,
    `Priority: ${MT_PRIORITY_LABELS[ticket.priority]}. Target: ${due}.`,
    reason === "escalated" ? "It has not been resolved in time — please follow up." : "Please assign it now.",
    link,
  ].join("\n");
  const html = `<p><strong>${escapeHtml(subject)}</strong></p>
<p>Priority: ${MT_PRIORITY_LABELS[ticket.priority]}. Target: ${escapeHtml(due)}.</p>
<p>${reason === "escalated" ? "It has not been resolved in time — please follow up." : "Please assign it now."}</p>
<p><a href="${link}">Open the ticket</a></p>`;
  const sms = `${head}: ${ticket.title}${where ? `, ${where}` : ""}. ${link}`;

  const rows: Record<string, unknown>[] = [];
  for (const person of await supervisors(db)) {
    if (person.email) {
      const r = await sendEmail({ to: person.email, subject, html, text });
      rows.push({ ticket_id: ticket.id, channel: "email", template: `mt_${reason}`, recipient: person.email, subject, body: text, status: r.status, provider_id: r.providerId, error: r.error, created_by: staffId });
    }
    if (person.phone) {
      const r = await sendSms({ to: person.phone, body: sms });
      rows.push({ ticket_id: ticket.id, channel: "sms", template: `mt_${reason}`, recipient: person.phone, subject: "", body: sms, status: r.status, provider_id: r.providerId, error: r.error, created_by: staffId });
    }
  }
  if (rows.length) await db.from("notifications").insert(rows);
}

/** Marks overdue tickets as escalated (once each) and alerts the supervisors. */
export async function escalateOverdueTickets(db: SupabaseClient, staffId: string | null = null) {
  const { data, error } = await db.rpc("mt_escalate_overdue");
  if (error || !data?.length) return 0;
  const tickets = data as (TicketForAlert & { room_id: string | null })[];
  const roomIds = tickets.map((t) => t.room_id).filter(Boolean) as string[];
  const { data: rooms } = roomIds.length
    ? await db.from("rooms").select("id, room_number").in("id", roomIds)
    : { data: [] };
  for (const t of tickets) {
    const room = (rooms ?? []).find((r) => r.id === t.room_id);
    await alertSupervisors(db, { ...t, rooms: room ? { room_number: room.room_number } : null }, "escalated", staffId);
  }
  return tickets.length;
}
