/**
 * Guest message templates (SOW Module 15: "email templates"; Module 16:
 * "admins must be able to edit templates without needing a developer, using
 * placeholders like {GuestName}, {CheckInDate}").
 *
 * The database holds the editable text per template and language
 * (message_templates); these defaults are the fallback and match the seed in
 * 0013_guest_crm_and_admin.sql.
 */
import type { MessageTemplate, MessageTemplateKey } from "./types";

export const TEMPLATE_LABELS: Record<MessageTemplateKey, { name: string; when: string }> = {
  request_received: { name: "Request received", when: "A guest sends a booking request from the website." },
  confirmation: { name: "Booking confirmation", when: "The desk confirms a booking, or sends it again." },
  cancellation: { name: "Cancellation", when: "A booking is cancelled." },
  final_bill: { name: "Final bill", when: "Express check-out emails the bill." },
};

export const PLACEHOLDERS: Record<string, string> = {
  GuestName: "Guest's full name",
  FirstName: "Guest's first name",
  Reference: "Reservation number, e.g. SR-1042",
  CheckInDate: "Arrival date",
  CheckOutDate: "Departure date",
  StayDates: "Arrival to departure",
  RoomType: "Room type booked",
  Guests: "Adults and children",
  Total: "Booking total",
  Balance: "Balance on the final bill",
  HotelName: "Property name (Settings)",
  HotelPhone: "Property phone",
  HotelEmail: "Property email",
  FeedbackLink: "Link to the guest's feedback form (final bill only)",
};

export const DEFAULT_TEMPLATES: Record<MessageTemplateKey, Omit<MessageTemplate, "template" | "language">> = {
  request_received: {
    subject: "We have your request — {Reference}",
    body: "Thank you for choosing {HotelName}. We have received your booking request and our front desk will confirm availability with you shortly. This is not yet a confirmation.",
    footer: "",
    sms: "{HotelName}: we have your request {Reference} for {StayDates}. We will confirm shortly.",
  },
  confirmation: {
    subject: "Booking confirmed — {Reference}",
    body: "Your stay at {HotelName} is confirmed. Please quote reservation {Reference} in any correspondence.",
    footer: "Please bring a government-issued photo ID for every adult. Foreign nationals need their passport and visa.",
    sms: "{HotelName}: booking confirmed {Reference}. {StayDates}. Total {Total}.",
  },
  cancellation: {
    subject: "Booking cancelled — {Reference}",
    body: "Your reservation {Reference} at {HotelName} has been cancelled.",
    footer: "",
    sms: "{HotelName}: booking {Reference} has been cancelled.",
  },
  final_bill: {
    subject: "Your bill — {Reference}",
    body: "Thank you for staying at {HotelName}. Your final bill is below.",
    footer: "We would love to hear about your stay: {FeedbackLink}",
    sms: "{HotelName}: thank you for staying. Your bill for {Reference} is in your email. Balance {Balance}.",
  },
};

/**
 * Fills {Placeholders}. Unknown names are left as written, so a typo is
 * visible rather than silently blank. A line whose placeholder has no value
 * (e.g. no feedback link) is dropped, so it never reads "…your stay: ".
 */
export function renderTemplate(text: string, values: Record<string, string>): string {
  return text
    .split("\n")
    .filter((line) => !/\{(\w+)\}/.test(line) || ![...line.matchAll(/\{(\w+)\}/g)].some(([, k]) => k in values && !values[k]))
    .map((line) => line.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? values[k] : m)))
    .join("\n")
    .trim();
}

/** Placeholders in a text that are not recognised — shown as a warning in the editor. */
export function unknownPlaceholders(text: string): string[] {
  return [...new Set([...text.matchAll(/\{(\w+)\}/g)].map(([, k]) => k).filter((k) => !(k in PLACEHOLDERS)))];
}

/** The template to use: the guest's language, else the property default, else English, else the built-in text. */
export function pickTemplate(
  rows: MessageTemplate[],
  template: MessageTemplateKey,
  languages: (string | null | undefined)[],
): Omit<MessageTemplate, "template" | "language"> {
  for (const lang of [...languages, "en"]) {
    const row = lang && rows.find((r) => r.template === template && r.language === lang);
    if (row) return row;
  }
  return DEFAULT_TEMPLATES[template];
}
