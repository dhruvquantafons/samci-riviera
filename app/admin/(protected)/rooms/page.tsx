import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { requireStaff } from "../../../lib/auth";
import type { Room, RoomType, Booking } from "../../../lib/types";
import { OCCUPYING_STATUSES, ROOM_STATUS_LABELS } from "../../../lib/types";
import { updateRoomStatus } from "../../actions";
import { PageHeader, Card, EmptyState, inputClass, fmtDate } from "../../components/ui";
import { todayIso, monthStartOf, shiftMonth, monthEndOf } from "../../../lib/dates";
import { canManageRates } from "../../../lib/types";

// How far the calendar can be paged in either direction.
const MONTHS_BACK = 3;
const MONTHS_FORWARD = 12;
import AddRoomForm from "./AddRoomForm";
import AvailabilityCalendar from "./AvailabilityCalendar";

export default async function RoomsPage() {
  const staff = await requireStaff();
  const supabase = await createClient();

  // Load a wide window of bookings once, so the calendar can page between
  // months instantly on the client without another round-trip.
  const thisMonth = monthStartOf(todayIso());
  const windowStart = shiftMonth(thisMonth, -MONTHS_BACK);
  const windowEnd = monthEndOf(shiftMonth(thisMonth, MONTHS_FORWARD));

  const [{ data: rooms }, { data: roomTypes }, { data: booked }, { data: inHouse }] =
    await Promise.all([
    supabase.from("rooms").select("*, room_types(name, slug)").order("room_number"),
    supabase.from("room_types").select("*").order("sort_order"),
    supabase
      .from("bookings")
      .select("*, room_types(id, name)")
      .in("status", OCCUPYING_STATUSES)
      .lte("check_in", windowEnd)
      .gt("check_out", windowStart),
    // Who is currently in each room, so the desk can see why it is occupied.
    supabase
      .from("bookings")
      .select("id, reference, contact_name, room_id, check_out, guests(full_name)")
      .eq("status", "checked_in")
      .not("room_id", "is", null),
  ]);

  const roomList = (rooms ?? []) as Room[];
  const types = (roomTypes ?? []) as RoomType[];
  const bookings = (booked ?? []) as Booking[];

  // Narrow shape: this query selects only what the inventory table renders.
  type Occupant = {
    id: string;
    contact_name: string;
    room_id: string | null;
    check_out: string;
    guests: { full_name: string } | { full_name: string }[] | null;
  };

  const occupantByRoom = new Map(
    ((inHouse ?? []) as unknown as Occupant[])
      .filter((b) => b.room_id)
      .map((b) => [b.room_id as string, b]),
  );

  // Supabase types an embedded to-one relation as an array in some versions.
  const guestName = (o: Occupant) =>
    (Array.isArray(o.guests) ? o.guests[0]?.full_name : o.guests?.full_name) ||
    o.contact_name ||
    "Guest";

  return (
    <>
      <PageHeader
        title="Rooms"
        description="Inventory and committed occupancy, month by month."
      />

      <div className="space-y-6">
        <AvailabilityCalendar
          roomTypes={types}
          rooms={roomList}
          bookings={bookings}
          rangeStart={windowStart}
          rangeEnd={windowEnd}
        />

        {canManageRates(staff.role) && (
          <Card className="p-5">
            <h2 className="font-serif text-lg text-[#1c1b1a] font-medium mb-4">Add a room</h2>
            <AddRoomForm roomTypes={types} />
          </Card>
        )}

        <Card>
          <h2 className="font-serif text-lg text-[#1c1b1a] font-medium px-5 py-4 border-b border-[#f0ece5]">
            Inventory ({roomList.length})
          </h2>

          <p className="px-5 pb-3 -mt-1 text-[11px] text-[#9a9490] font-light">
            Occupied is set automatically when a booking with this room assigned is
            checked in, and cleared on check-out. Use maintenance or out of service to
            take a room off sale.
          </p>

          {roomList.length === 0 ? (
            <EmptyState message="No rooms added yet. Add your first room above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-[#9a9490] border-b border-[#f0ece5]">
                    <th className="px-5 py-3 font-semibold">Room</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Floor</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Occupant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece5]">
                  {roomList.map((room) => (
                    <tr key={room.id} className="hover:bg-[#faf9f6] transition-colors">
                      <td className="px-5 py-3 font-medium text-[#1c1b1a]">{room.room_number}</td>
                      <td className="px-5 py-3 text-[#5a5854]">{room.room_types?.name ?? "—"}</td>
                      <td className="px-5 py-3 text-[#5a5854]">{room.floor ?? "—"}</td>
                      <td className="px-5 py-3">
                        <form action={updateRoomStatus}>
                          <input type="hidden" name="id" value={room.id} />
                          <select
                            name="status"
                            defaultValue={room.status}
                            className={`${inputClass} !py-1.5 !text-xs max-w-[170px]`}
                            // Submitting on change keeps this to one interaction.
                            // Progressive enhancement: without JS the select still posts on Enter.
                          >
                            {Object.entries(ROOM_STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="sr-only">
                            Update status
                          </button>
                        </form>
                      </td>
                      <td className="px-5 py-3">
                        {(() => {
                          const stay = occupantByRoom.get(room.id);
                          if (!stay) {
                            return <span className="text-[#c9c4bc]">—</span>;
                          }
                          return (
                            <Link
                              href={`/admin/bookings/${stay.id}`}
                              className="text-[#a88956] hover:text-[#8f7343] transition-colors"
                            >
                              {guestName(stay)}
                              <span className="block text-[11px] text-[#9a9490]">
                                out {fmtDate(stay.check_out)}
                              </span>
                            </Link>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
