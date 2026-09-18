import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { requireBookingsAccess } from "../../../lib/auth";
import type { Booking, BookingStatus } from "../../../lib/types";
import { BOOKING_STATUS_LABELS, BOOKING_SOURCE_LABELS } from "../../../lib/types";
import {
  PageHeader,
  Card,
  StatusPill,
  EmptyState,
  fmtDate,
  fmtMoney,
  inputClass,
  buttonClass,
  nightsBetween,
} from "../../components/ui";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => ({
    value: s,
    label: BOOKING_STATUS_LABELS[s],
  })),
];

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireBookingsAccess();
  const { status = "all", q = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select("*, guests(id, full_name, email, phone), room_types(id, name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status !== "all") query = query.eq("status", status);
  if (q) {
    const term = `%${q}%`;
    query = query.or(
      `reference.ilike.${term},contact_name.ilike.${term},contact_email.ilike.${term},contact_phone.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  const bookings = (data ?? []) as Booking[];

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Every reservation request and confirmed stay."
        action={
          <Link href="/admin/bookings/new" className={buttonClass}>
            <span className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New booking
            </span>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => {
          const params = new URLSearchParams();
          if (f.value !== "all") params.set("status", f.value);
          if (q) params.set("q", q);
          const href = `/admin/bookings${params.toString() ? `?${params}` : ""}`;
          const active = status === f.value;
          return (
            <Link
              key={f.value}
              href={href}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                active
                  ? "bg-[#a88956] text-white border-[#a88956] font-medium"
                  : "bg-white text-[#5a5854] border-[#e5e0d8] hover:border-[#a88956]"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <form className="flex gap-2 mb-5" action="/admin/bookings">
        {status !== "all" && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9a9490] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Reference, name, email or phone"
            className={`${inputClass} pl-9`}
          />
        </div>
        <button type="submit" className={buttonClass}>
          Search
        </button>
      </form>

      <Card>
        {error ? (
          <EmptyState message={`Could not load bookings: ${error.message}`} />
        ) : bookings.length === 0 ? (
          <EmptyState message="No bookings match this view." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-[#9a9490] border-b border-[#f0ece5]">
                  <th className="px-5 py-3 font-semibold">Guest</th>
                  <th className="px-5 py-3 font-semibold">Stay</th>
                  <th className="px-5 py-3 font-semibold">Room</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece5]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="block">
                        <span className="font-medium text-[#1c1b1a]">
                          {b.guests?.full_name || b.contact_name || "Unnamed guest"}
                        </span>
                        <span className="block text-[11px] text-[#9a9490] font-mono">
                          {b.reference}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[#5a5854]">
                      {fmtDate(b.check_in)} → {fmtDate(b.check_out)}
                      <span className="block text-[11px] text-[#9a9490]">
                        {nightsBetween(b.check_in, b.check_out)} night(s), {b.adults + b.children} guest(s)
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#5a5854]">
                      {b.room_types?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-[#5a5854] whitespace-nowrap">
                      {BOOKING_SOURCE_LABELS[b.source]}
                    </td>
                    <td className="px-5 py-3 text-[#5a5854] whitespace-nowrap">
                      {fmtMoney(b.total_amount)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
