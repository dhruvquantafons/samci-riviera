import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, User } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import { requireBookingsAccess } from "../../../../lib/auth";
import type { Booking, BookingNote, RoomType, Room } from "../../../../lib/types";
import { BOOKING_SOURCE_LABELS } from "../../../../lib/types";
import { updateBookingStatus, addBookingNote } from "../../../actions";
import {
  Card,
  StatusPill,
  fmtDate,
  fmtDateTime,
  fmtMoney,
  nightsBetween,
  inputClass,
  buttonClass,
  secondaryButtonClass,
} from "../../../components/ui";
import EditBookingForm from "./EditBookingForm";

const NEXT_STATUS = [
  { value: "confirmed", label: "Confirm" },
  { value: "checked_in", label: "Check in" },
  { value: "checked_out", label: "Check out" },
  { value: "cancelled", label: "Cancel" },
  { value: "no_show", label: "No show" },
];

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireBookingsAccess();
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("*, guests(id, full_name, email, phone), room_types(id, name), rooms(id, room_number)")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const booking = data as Booking;

  const [{ data: notes }, { data: roomTypes }, { data: rooms }] = await Promise.all([
    supabase
      .from("booking_notes")
      .select("*, staff(full_name, email)")
      .eq("booking_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("room_types").select("*").order("sort_order"),
    supabase.from("rooms").select("*").order("room_number"),
  ]);

  return (
    <>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-xs text-[#7a7771] hover:text-[#a88956] mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to bookings
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[#1c1b1a] font-medium">
            {booking.guests?.full_name || booking.contact_name || "Unnamed guest"}
          </h1>
          <p className="text-xs text-[#9a9490] font-mono mt-1">{booking.reference}</p>
        </div>
        <StatusPill status={booking.status} />
      </div>

      {/* Status actions */}
      <Card className="p-4 mb-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#7a7771] font-semibold mb-3">
          Move this booking to
        </p>
        <div className="flex flex-wrap gap-2">
          {NEXT_STATUS.filter((s) => s.value !== booking.status).map((s) => (
            <form key={s.value} action={updateBookingStatus}>
              <input type="hidden" name="id" value={booking.id} />
              <input type="hidden" name="status" value={s.value} />
              <button type="submit" className={secondaryButtonClass}>
                {s.label}
              </button>
            </form>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <Card className="p-5">
            <h2 className="font-serif text-lg text-[#1c1b1a] font-medium mb-4">Stay</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">Check in</dt>
                <dd className="text-[#1c1b1a] mt-0.5">{fmtDate(booking.check_in)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">Check out</dt>
                <dd className="text-[#1c1b1a] mt-0.5">{fmtDate(booking.check_out)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">Nights</dt>
                <dd className="text-[#1c1b1a] mt-0.5">
                  {nightsBetween(booking.check_in, booking.check_out)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">Guests</dt>
                <dd className="text-[#1c1b1a] mt-0.5">
                  {booking.adults} adult(s){booking.children > 0 && `, ${booking.children} child(ren)`}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">Rooms</dt>
                <dd className="text-[#1c1b1a] mt-0.5">{booking.rooms_count}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">Source</dt>
                <dd className="text-[#1c1b1a] mt-0.5">{BOOKING_SOURCE_LABELS[booking.source]}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">Room type</dt>
                <dd className="text-[#1c1b1a] mt-0.5">{booking.room_types?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">Assigned room</dt>
                <dd className="text-[#1c1b1a] mt-0.5">{booking.rooms?.room_number ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">Total</dt>
                <dd className="text-[#1c1b1a] mt-0.5">{fmtMoney(booking.total_amount)}</dd>
              </div>
            </dl>

            {booking.special_requests && (
              <div className="mt-5 pt-4 border-t border-[#f0ece5]">
                <p className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold mb-1">
                  Special requests
                </p>
                <p className="text-sm text-[#5a5854] font-light whitespace-pre-line">
                  {booking.special_requests}
                </p>
              </div>
            )}
          </Card>

          {/* Editable details */}
          <Card className="p-5">
            <h2 className="font-serif text-lg text-[#1c1b1a] font-medium mb-4">Amend booking</h2>
            <EditBookingForm
              booking={booking}
              roomTypes={(roomTypes ?? []) as RoomType[]}
              rooms={(rooms ?? []) as Room[]}
            />
          </Card>

          {/* Notes */}
          <Card className="p-5">
            <h2 className="font-serif text-lg text-[#1c1b1a] font-medium mb-4">Internal notes</h2>

            <form action={addBookingNote} className="flex gap-2 mb-5">
              <input type="hidden" name="booking_id" value={booking.id} />
              <input
                name="body"
                required
                placeholder="Add a note for the team…"
                className={inputClass}
              />
              <button type="submit" className={buttonClass}>
                Add
              </button>
            </form>

            {(notes ?? []).length === 0 ? (
              <p className="text-sm text-[#9a9490] font-light">No notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {((notes ?? []) as BookingNote[]).map((note) => (
                  <li key={note.id} className="border-l-2 border-[#e5e0d8] pl-3">
                    <p className="text-sm text-[#1c1b1a] whitespace-pre-line">{note.body}</p>
                    <p className="text-[11px] text-[#9a9490] mt-0.5">
                      {note.staff?.full_name || note.staff?.email || "Unknown"} ·{" "}
                      {fmtDateTime(note.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Contact sidebar */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-serif text-lg text-[#1c1b1a] font-medium mb-4">Contact</h2>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2 text-[#5a5854]">
                <User className="w-4 h-4 text-[#a88956] shrink-0 mt-0.5" />
                <span>{booking.contact_name || booking.guests?.full_name || "—"}</span>
              </p>
              {(booking.contact_phone || booking.guests?.phone) && (
                <a
                  href={`tel:${booking.contact_phone || booking.guests?.phone}`}
                  className="flex items-start gap-2 text-[#a88956] hover:text-[#8f7343] transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{booking.contact_phone || booking.guests?.phone}</span>
                </a>
              )}
              {(booking.contact_email || booking.guests?.email) && (
                <a
                  href={`mailto:${booking.contact_email || booking.guests?.email}`}
                  className="flex items-start gap-2 text-[#a88956] hover:text-[#8f7343] transition-colors break-all"
                >
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{booking.contact_email || booking.guests?.email}</span>
                </a>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold">
              Created
            </p>
            <p className="text-sm text-[#5a5854] mt-1">{fmtDateTime(booking.created_at)}</p>
            <p className="text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold mt-3">
              Last updated
            </p>
            <p className="text-sm text-[#5a5854] mt-1">{fmtDateTime(booking.updated_at)}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
