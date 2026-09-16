import type { Room, RoomType, Booking } from "../../../lib/types";
import { Card } from "../../components/ui";

/**
 * Committed occupancy per room type for the next fortnight.
 *
 * A booking occupies a night when check_in <= night < check_out, so the
 * departure date itself is free. Counts are per room type because the desk
 * assigns a specific room later.
 */
export default function AvailabilityCalendar({
  days,
  roomTypes,
  rooms,
  bookings,
}: {
  days: string[];
  roomTypes: RoomType[];
  rooms: Room[];
  bookings: Booking[];
}) {
  const capacityFor = (typeId: string) =>
    rooms.filter((r) => r.room_type_id === typeId && r.status !== "out_of_service").length;

  const bookedOn = (typeId: string, day: string) =>
    bookings
      .filter((b) => b.room_type_id === typeId && b.check_in <= day && b.check_out > day)
      .reduce((sum, b) => sum + b.rooms_count, 0);

  const unassigned = bookings.filter((b) => !b.room_type_id);

  return (
    <Card>
      <div className="px-5 py-4 border-b border-[#f0ece5]">
        <h2 className="font-serif text-lg text-[#1c1b1a] font-medium">Availability</h2>
        <p className="text-xs text-[#7a7771] font-light mt-0.5">
          Rooms free per night, next 14 days. Based on new, confirmed and checked-in bookings.
        </p>
      </div>

      {roomTypes.length === 0 || rooms.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[#9a9490] font-light text-center">
          Add rooms to your inventory to see availability.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white px-4 py-2.5 text-left text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold border-b border-[#f0ece5] min-w-[140px]">
                  Room type
                </th>
                {days.map((day) => {
                  const d = new Date(day + "T00:00:00");
                  const weekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <th
                      key={day}
                      className={`px-2 py-2.5 text-center border-b border-[#f0ece5] font-medium min-w-[46px] ${
                        weekend ? "bg-[#faf9f6]" : ""
                      }`}
                    >
                      <span className="block text-[9px] uppercase text-[#9a9490]">
                        {d.toLocaleDateString("en-IN", { weekday: "narrow" })}
                      </span>
                      <span className="block text-[11px] text-[#5a5854]">{d.getDate()}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((rt) => {
                const capacity = capacityFor(rt.id);
                return (
                  <tr key={rt.id}>
                    <td className="sticky left-0 bg-white px-4 py-2.5 border-b border-[#f0ece5]">
                      <span className="block text-[#1c1b1a] font-medium">{rt.name}</span>
                      <span className="block text-[11px] text-[#9a9490]">
                        {capacity} room(s)
                      </span>
                    </td>
                    {days.map((day) => {
                      const free = capacity - bookedOn(rt.id, day);
                      const tone =
                        capacity === 0
                          ? "text-[#c9c4bc]"
                          : free <= 0
                            ? "bg-rose-50 text-rose-700 font-semibold"
                            : free <= Math.max(1, Math.floor(capacity * 0.25))
                              ? "bg-amber-50 text-amber-800 font-medium"
                              : "text-[#5a5854]";
                      return (
                        <td
                          key={day}
                          title={`${rt.name} · ${day} · ${Math.max(0, free)} free of ${capacity}`}
                          className={`px-2 py-2.5 text-center border-b border-[#f0ece5] text-xs ${tone}`}
                        >
                          {capacity === 0 ? "—" : free <= 0 ? "Full" : free}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {unassigned.length > 0 && (
        <p className="px-5 py-3 text-[11px] text-amber-800 bg-amber-50 border-t border-amber-200">
          {unassigned.length} booking(s) in this window have no room type set, so they are
          not counted above.
        </p>
      )}
    </Card>
  );
}
