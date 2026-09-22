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
  if (message.startsWith("INVOICE_IMMUTABLE")) {
    return "An issued invoice cannot be changed or deleted. Cancel it and issue a new one.";
  }
  if (message.startsWith("INVOICE_CANCELLED")) {
    return "That invoice is already cancelled.";
  }
  if (message.startsWith("REFUND_SELF_APPROVAL")) {
    return "A refund must be approved by someone other than the person who requested it.";
  }
  if (message.startsWith("FOLIO_BOOKING_MISMATCH")) {
    return "That folio belongs to a different booking.";
  }

  // City ledger (Module 7)
  if (message.startsWith("CITY_LEDGER_CREDIT_LIMIT:")) {
    return `Over the credit limit — ${message.slice("CITY_LEDGER_CREDIT_LIMIT:".length).trim()}. Take a payment on account, or raise the limit under Companies.`;
  }
  if (message.startsWith("CITY_LEDGER_ALREADY_TRANSFERRED")) {
    return "This bill is already on a company account. Open a new folio for anything charged since.";
  }
  if (message.startsWith("CITY_LEDGER_NOTHING_OWED")) {
    return "There is nothing left to bill on this folio.";
  }
  if (message.startsWith("CITY_LEDGER_INACTIVE")) {
    return "That company account is closed. Reactivate it under Companies first.";
  }
  if (message.startsWith("CITY_LEDGER_INVOICED")) {
    return "This charge has been invoiced. Cancel the invoice before voiding the transfer.";
  }
  if (message.startsWith("CITY_LEDGER_ALREADY_VOID")) {
    return "That entry is already voided.";
  }
  if (message.startsWith("CITY_LEDGER_VOID_REASON")) {
    return "Give a reason for voiding this entry.";
  }
  if (message.startsWith("CITY_LEDGER_NO_COMPANY")) {
    return "Choose a company to bill.";
  }
  if (message.startsWith("CITY_LEDGER_NO_FOLIO") || message.startsWith("CITY_LEDGER_NO_ENTRY")) {
    return "That record no longer exists. Refresh the page.";
  }
  if (message.startsWith("CURRENCY_BASE_RATE")) {
    return "The property's own currency is always held at a rate of 1.";
  }

  // Loyalty (Module 8)
  if (message.startsWith("LOYALTY_INSUFFICIENT:")) {
    return `Not enough points — ${message.slice("LOYALTY_INSUFFICIENT:".length).trim()}.`;
  }
  if (message.startsWith("LOYALTY_BELOW_MINIMUM:")) {
    return `Too few points — ${message.slice("LOYALTY_BELOW_MINIMUM:".length).trim()}.`;
  }
  if (message.startsWith("LOYALTY_OVER_BALANCE:")) {
    return `Worth more than the bill — ${message.slice("LOYALTY_OVER_BALANCE:".length).trim()}. Redeem fewer points.`;
  }
  if (message.startsWith("LOYALTY_NOT_A_MEMBER")) {
    return "Enrol the guest in the loyalty programme first.";
  }
  if (message.startsWith("LOYALTY_NO_REDEEM_RATE")) {
    return "This tier has no redemption rate set. Set one under Guests → Loyalty.";
  }
  if (message.startsWith("LOYALTY_NOTHING_OWED")) {
    return "There is nothing left to settle on this folio.";
  }
  if (message.startsWith("LOYALTY_POINTS_INVALID")) {
    return "Enter a whole number of points.";
  }
  if (message.startsWith("LOYALTY_REASON_REQUIRED")) {
    return "Give a reason for the correction.";
  }
  if (message.startsWith("LOYALTY_NO_TIERS")) {
    return "Set up at least one membership tier before enrolling guests.";
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
