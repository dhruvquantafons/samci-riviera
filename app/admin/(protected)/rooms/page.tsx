import { createClient } from "../../../lib/supabase/server";
import { requireStaff } from "../../../lib/auth";
import type { Room, RoomType, Booking } from "../../../lib/types";
import { OCCUPYING_STATUSES, ROOM_STATUS_LABELS } from "../../../lib/types";
import { updateRoomStatus } from "../../actions";
import { PageHeader, Card, EmptyState, inputClass } from "../../components/ui";
import AddRoomForm from "./AddRoomForm";
import AvailabilityCalendar from "./AvailabilityCalendar";

export default async function RoomsPage() {
  await requireStaff();
  const supabase = await createClient();

  // Two weeks of occupancy from today is enough for the desk to plan around.
  const start = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().split("T")[0];
  });
  const windowStart = days[0];
  const windowEnd = days[days.length - 1];

  const [{ data: rooms }, { data: roomTypes }, { data: booked }] = await Promise.all([
    supabase.from("rooms").select("*, room_types(name, slug)").order("room_number"),
    supabase.from("room_types").select("*").order("sort_order"),
    supabase
      .from("bookings")
      .select("*, room_types(id, name)")
      .in("status", OCCUPYING_STATUSES)
      .lte("check_in", windowEnd)
      .gt("check_out", windowStart),
  ]);

  const roomList = (rooms ?? []) as Room[];
  const types = (roomTypes ?? []) as RoomType[];
  const bookings = (booked ?? []) as Booking[];

  return (
    <>
      <PageHeader
        title="Rooms"
        description="Inventory and the next two weeks of committed occupancy."
      />

      <div className="space-y-6">
        <AvailabilityCalendar days={days} roomTypes={types} rooms={roomList} bookings={bookings} />

        <Card className="p-5">
          <h2 className="font-serif text-lg text-[#1c1b1a] font-medium mb-4">Add a room</h2>
          <AddRoomForm roomTypes={types} />
        </Card>

        <Card>
          <h2 className="font-serif text-lg text-[#1c1b1a] font-medium px-5 py-4 border-b border-[#f0ece5]">
            Inventory ({roomList.length})
          </h2>

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
