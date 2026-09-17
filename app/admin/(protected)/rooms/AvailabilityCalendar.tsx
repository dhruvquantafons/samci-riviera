"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Room, RoomType, Booking } from "../../../lib/types";
import {
  todayIso,
  monthStartOf,
  shiftMonth,
  daysInMonth,
} from "../../../lib/dates";
import { Card, secondaryButtonClass } from "../../components/ui";

type DayCell = { iso: string; day: number } | null;

/**
 * Month calendar of committed occupancy.
 *
 * The displayed month is local state, not a URL parameter: paging is instant
 * and needs no server round-trip. The page loads a wide window of bookings up
 * front so any month in range can be rendered without refetching.
 *
 * A booking occupies a night when check_in <= night < check_out, so the
 * departure date itself is free.
 */
export default function AvailabilityCalendar({
  roomTypes,
  rooms,
  bookings,
  rangeStart,
  rangeEnd,
}: {
  roomTypes: RoomType[];
  rooms: Room[];
  bookings: Booking[];
  /** Bounds of the loaded booking window, as yyyy-mm-dd. */
  rangeStart: string;
  rangeEnd: string;
}) {
  const today = todayIso();
  const thisMonth = monthStartOf(today);
  const [month, setMonth] = useState(thisMonth);

  const minMonth = monthStartOf(rangeStart);
  const maxMonth = monthStartOf(rangeEnd);
  const canGoBack = month > minMonth;
  const canGoForward = month < maxMonth;

  const [year, monthNumber] = month.split("-").map(Number);
  const total = daysInMonth(month);

  const iso = (day: number) =>
    `${year}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Pad so the 1st lands under the right weekday (weeks start Monday).
  const leading = (new Date(year, monthNumber - 1, 1).getDay() + 6) % 7;
  const cells: DayCell[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: total }, (_, i) => ({ iso: iso(i + 1), day: i + 1 })),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const usableRooms = rooms.filter((r) => r.status !== "out_of_service");
  const capacity = usableRooms.length;

  const bookedOn = (day: string, typeId?: string) =>
    bookings
      .filter(
        (b) =>
          b.check_in <= day &&
          b.check_out > day &&
          (typeId ? b.room_type_id === typeId : true),
      )
      .reduce((sum, b) => sum + b.rooms_count, 0);

  const monthLabel = new Date(year, monthNumber - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#f0ece5]">
        <div>
          <h2 className="font-serif text-lg text-[#1c1b1a] font-medium">Availability</h2>
          <p className="text-xs text-[#7a7771] font-light mt-0.5">
            Rooms free per night. Counts new, confirmed and checked-in bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {month !== thisMonth && (
            <button
              type="button"
              onClick={() => setMonth(thisMonth)}
              className={`${secondaryButtonClass} !py-1.5`}
            >
              Today
            </button>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(month, -1))}
              disabled={!canGoBack}
              aria-label="Previous month"
              className="p-1.5 rounded-lg border border-[#e5e0d8] text-[#5a5854] hover:border-[#a88956] hover:text-[#a88956] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#e5e0d8] disabled:hover:text-[#5a5854]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span
              aria-live="polite"
              className="font-serif text-base text-[#1c1b1a] font-medium min-w-[150px] text-center"
            >
              {monthLabel}
            </span>

            <button
              type="button"
              onClick={() => setMonth(shiftMonth(month, 1))}
              disabled={!canGoForward}
              aria-label="Next month"
              className="p-1.5 rounded-lg border border-[#e5e0d8] text-[#5a5854] hover:border-[#a88956] hover:text-[#a88956] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#e5e0d8] disabled:hover:text-[#5a5854]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {capacity === 0 ? (
        <p className="px-5 py-10 text-sm text-[#9a9490] font-light text-center">
          Add rooms to your inventory to see availability.
        </p>
      ) : (
        <>
          <div className="p-3 sm:p-5">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] uppercase tracking-wider text-[#9a9490] font-semibold py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {cells.map((cell, i) => {
                if (!cell) return <div key={`pad-${i}`} />;

                const booked = bookedOn(cell.iso);
                const free = capacity - booked;
                const isToday = cell.iso === today;
                const isPast = cell.iso < today;

                const tone =
                  free <= 0
                    ? "bg-rose-50 border-rose-200"
                    : free <= Math.max(1, Math.floor(capacity * 0.2))
                      ? "bg-amber-50 border-amber-200"
                      : "bg-white border-[#f0ece5]";

                return (
                  <div
                    key={cell.iso}
                    title={`${cell.iso} — ${Math.max(0, free)} of ${capacity} free`}
                    className={`rounded-lg border p-1.5 sm:p-2 min-h-[64px] sm:min-h-[80px] flex flex-col transition-colors ${tone} ${
                      isPast ? "opacity-45" : ""
                    } ${isToday ? "ring-2 ring-[#a88956] ring-offset-1" : ""}`}
                  >
                    <span
                      className={`text-[11px] font-medium ${
                        isToday ? "text-[#a88956]" : "text-[#5a5854]"
                      }`}
                    >
                      {cell.day}
                    </span>

                    <span className="mt-auto">
                      {free <= 0 ? (
                        <span className="block text-[10px] sm:text-[11px] font-semibold text-rose-700">
                          Full
                        </span>
                      ) : (
                        <span className="block text-sm sm:text-base font-serif font-medium text-[#1c1b1a] leading-none">
                          {free}
                          <span className="text-[10px] text-[#9a9490] font-sans ml-0.5">free</span>
                        </span>
                      )}
                      {booked > 0 && (
                        <span className="block text-[9px] text-[#9a9490] mt-0.5">
                          {booked} booked
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {roomTypes.length > 1 && (
            <div className="px-5 pb-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a9490] font-semibold mb-2">
                By room type, today
              </p>
              <div className="flex flex-wrap gap-2">
                {roomTypes.map((rt) => {
                  const typeCapacity = usableRooms.filter(
                    (r) => r.room_type_id === rt.id,
                  ).length;
                  const free = typeCapacity - bookedOn(today, rt.id);
                  return (
                    <span
                      key={rt.id}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#e5e0d8] bg-white text-[#5a5854]"
                    >
                      {rt.name}:{" "}
                      <strong className="font-medium text-[#1c1b1a]">
                        {typeCapacity === 0
                          ? "no rooms"
                          : `${Math.max(0, free)} of ${typeCapacity}`}
                      </strong>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
