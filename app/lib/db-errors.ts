/**
 * Turns the database's guard errors into sentences for the desk.
 *
 * enforce_booking_inventory() raises messages prefixed OVERBOOKED:,
 * ROOM_CONFLICT: and ROOM_BLOCKED:, which carry the detail after the colon.
 */
export function friendlyDbError(message: string | undefined | null): string {
  if (!message) return "Something went wrong. Please try again.";

  if (message.startsWith("OVERBOOKED:")) {
    return `No availability — ${message.slice("OVERBOOKED:".length).trim()}. Waitlist the guest, choose other dates or room type, or (with permission) override with a reason.`;
  }
  if (message.startsWith("ROOM_CONFLICT:")) {
    return `Room clash — ${message.slice("ROOM_CONFLICT:".length).trim()} for overlapping nights.`;
  }
  if (message.startsWith("ROOM_BLOCKED:")) {
    return `Room unavailable — ${message.slice("ROOM_BLOCKED:".length).trim()}.`;
  }
  if (message.startsWith("BUSINESS_DATE_MOVED:")) {
    return "Night audit has already moved the business date. Refresh and check the current date.";
  }
  if (/row-level security/i.test(message)) {
    return "Your role does not allow that change.";
  }
  if (/duplicate key/i.test(message)) {
    return "That already exists.";
  }
  return message;
}

export function isOverbooked(message: string | undefined | null) {
  return Boolean(message?.startsWith("OVERBOOKED:"));
}
