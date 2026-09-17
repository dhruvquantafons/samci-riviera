/**
 * Date helpers for calendar work.
 *
 * `toISOString()` converts to UTC first, so in any timezone ahead of UTC it
 * reports the previous day for times before the offset — in India (UTC+5:30)
 * every moment between midnight and 05:30 comes back as yesterday. Hotel dates
 * are local calendar days, never instants, so they are formatted from the
 * local parts instead.
 */

/** yyyy-mm-dd from a Date's local calendar parts. */
export function toLocalIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today as yyyy-mm-dd in the viewer's timezone. */
export function todayIso(): string {
  return toLocalIso(new Date());
}

/** yyyy-mm-dd, `days` from today. */
export function isoPlusDays(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return toLocalIso(d);
}

/** First day of the month containing `iso`, as yyyy-mm-01. */
export function monthStartOf(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

/** First day of the month `delta` months from `monthIso` (a yyyy-mm-01). */
export function shiftMonth(monthIso: string, delta: number): string {
  const [year, month] = monthIso.split("-").map(Number);
  // Day 1 avoids the classic "31 January + 1 month" overflow.
  return toLocalIso(new Date(year, month - 1 + delta, 1));
}

/** Last day of the month containing `monthIso`. */
export function monthEndOf(monthIso: string): string {
  const [year, month] = monthIso.split("-").map(Number);
  return toLocalIso(new Date(year, month, 0));
}

/** Number of days in the month containing `monthIso`. */
export function daysInMonth(monthIso: string): number {
  const [year, month] = monthIso.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}
