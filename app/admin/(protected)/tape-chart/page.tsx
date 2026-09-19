import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { requireAnyPermission } from "../../../lib/auth";
import { can } from "../../../lib/permissions";
import { getSettings } from "../../../lib/settings";
import { addDays, daysBetween, dayOfWeek, isIsoDate, todayIn } from "../../../lib/dates";
import type { Booking, BookingStatus, Room, RoomBlock, RoomType } from "../../../lib/types";
import { BOOKING_STATUS_LABELS, roomBoardLabel } from "../../../lib/types";
import { PageHeader, Card, secondaryButtonClass } from "../../components/ui";
import LiveRefresh from "../../components/LiveRefresh";

const SPANS = [7, 14, 30] as const;

const BAR: Record<BookingStatus, string> = {
  tentative: "bg-amber-100 border-amber-300 text-amber-900",
  confirmed: "bg-emerald-100 border-emerald-300 text-emerald-900",
  checked_in: "bg-blue-100 border-blue-300 text-blue-900",
  checked_out: "bg-slate-100 border-slate-300 text-slate-600",
  cancelled: "bg-rose-50 border-rose-200 text-rose-700",
  no_show: "bg-orange-50 border-orange-200 text-orange-800",
  waitlisted: "bg-violet-50 border-violet-200 text-violet-800",
};

type Bar = { from: number; to: number; clipStart: boolean; clipEnd: boolean };

/** Column span of a stay within the window, or null if it falls outside. */
function span(checkIn: string, checkOut: string, start: string, days: number): Bar | null {
  const from = daysBetween(start, checkIn);
  const to = daysBetween(start, checkOut);
  if (to <= 0 || from >= days) return null;
  return { from: Math.max(0, from), to: Math.min(days, to), clipStart: from < 0, clipEnd: to > days };
}

/** Packs overlapping stays into as few lanes as possible. */
function lanes(bookings: Booking[]): Booking[][] {
  const result: Booking[][] = [];
  for (const b of [...bookings].sort((a, z) => a.check_in.localeCompare(z.check_in))) {
    const lane = result.find((l) => l.every((o) => o.check_out <= b.check_in || o.check_in >= b.check_out));
    if (lane) lane.push(b);
    else result.push([b]);
  }
  return result;
}

export default async function TapeChartPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; days?: string }>;
}) {
  const session = await requireAnyPermission(["bookings.view", "frontdesk.view"]);
  const params = await searchParams;
  const supabase = await createClient();
  const settings = await getSettings();
  const today = todayIn(settings.timezone);

  const days = SPANS.find((s) => String(s) === params.days) ?? 14;
  const start = params.start && isIsoDate(params.start) ? params.start : addDays(today, -1);
  const end = addDays(start, days);
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));

  const [{ data: rooms }, { data: types }, { data: bookings }, { data: blocks }] = await Promise.all([
    supabase.from("rooms").select("*").order("room_number"),
    supabase.from("room_types").select("*").order("sort_order"),
    supabase
      .from("bookings")
      .select("id, reference, contact_name, check_in, check_out, status, room_id, room_type_id, rooms_count, is_vip")
      .in("status", ["tentative", "confirmed", "checked_in", "checked_out"])
      .lt("check_in", end)
      .gt("check_out", start),
    supabase.from("room_blocks").select("*").is("released_at", null).lt("start_date", end),
  ]);

  const roomList = (rooms ?? []) as Room[];
  const typeList = (types ?? []) as RoomType[];
  const stays = (bookings ?? []) as Booking[];
  const blockList = ((blocks ?? []) as RoomBlock[]).filter((b) => b.end_date === null || b.end_date >= start);
  const canCreate = can(session, "bookings.create");

  const link = (s: string, d: number = days) => `/admin/tape-chart?start=${s}&days=${d}`;
  const grid = { gridTemplateColumns: `repeat(${days}, minmax(${days > 14 ? 28 : 44}px, 1fr))` };

  const DayCells = ({ roomTypeId }: { roomTypeId: string }) => (
    <>
      {dates.map((d, i) => {
        const weekend = [5, 6].includes(dayOfWeek(d));
        const cls = `h-9 border-r border-slate-100 ${d === today ? "bg-yellow-50" : weekend ? "bg-slate-50" : ""}`;
        return canCreate && d >= today ? (
          <Link
            key={d}
            href={`/admin/bookings/new?check_in=${d}&room_type=${roomTypeId}`}
            title={`New booking from ${d}`}
            className={`${cls} hover:bg-yellow-50`}
            style={{ gridColumn: `${i + 1} / ${i + 2}`, gridRow: 1 }}
          />
        ) : (
          <div key={d} className={cls} style={{ gridColumn: `${i + 1} / ${i + 2}`, gridRow: 1 }} />
        );
      })}
    </>
  );

  const BookingBar = ({ b }: { b: Booking }) => {
    const s = span(b.check_in, b.check_out, start, days);
    if (!s) return null;
    return (
      <Link
        href={`/admin/bookings/${b.id}`}
        title={`${b.contact_name} · ${b.reference} · ${BOOKING_STATUS_LABELS[b.status]} · ${b.check_in} → ${b.check_out}`}
        className={`relative z-10 m-1 flex items-center truncate border px-1.5 text-[11px] font-medium ${BAR[b.status]} ${
          s.clipStart ? "rounded-l-none border-l-0" : "rounded-l-md"
        } ${s.clipEnd ? "rounded-r-none border-r-0" : "rounded-r-md"}`}
        style={{ gridColumn: `${s.from + 1} / ${s.to + 1}`, gridRow: 1 }}
      >
        {b.is_vip ? "★ " : ""}
        {b.contact_name || b.reference}
        {b.rooms_count > 1 ? ` ×${b.rooms_count}` : ""}
      </Link>
    );
  };

  return (
    <>
      <LiveRefresh />
      <PageHeader
        title="Tape chart"
        description="Every room and every stay. Click a stay to open it, or an empty day to book from that date."
        action={
          <div className="flex items-center gap-2">
            <Link href={link(addDays(start, -days))} className={`${secondaryButtonClass} !px-2`} aria-label="Earlier">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link href={link(addDays(today, -1))} className={secondaryButtonClass}>
              Today
            </Link>
            <Link href={link(addDays(start, days))} className={`${secondaryButtonClass} !px-2`} aria-label="Later">
              <ChevronRight className="w-4 h-4" />
            </Link>
            {SPANS.map((s) => (
              <Link
                key={s}
                href={link(start, s)}
                className={`text-xs px-2.5 py-1.5 rounded-full border ${
                  s === days ? "bg-yellow-400 text-slate-900 border-yellow-500" : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                {s}d
              </Link>
            ))}
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4 text-[11px]">
        {(["tentative", "confirmed", "checked_in", "checked_out"] as BookingStatus[]).map((s) => (
          <span key={s} className={`px-2 py-0.5 rounded border ${BAR[s]}`}>
            {BOOKING_STATUS_LABELS[s]}
          </span>
        ))}
        <span className="px-2 py-0.5 rounded border bg-[repeating-linear-gradient(45deg,#e7e5e4,#e7e5e4_4px,#f5f5f4_4px,#f5f5f4_8px)] border-stone-300 text-stone-700">
          Blocked
        </span>
      </div>

      <Card className="overflow-x-auto">
        <div className="min-w-max">
          {/* Date header */}
          <div className="flex sticky top-0 z-20 bg-white border-b border-slate-200">
            <div className="w-36 shrink-0 px-3 py-2 text-xs text-slate-500 font-semibold sticky left-0 bg-white">
              Room
            </div>
            <div className="grid flex-1" style={grid}>
              {dates.map((d) => {
                const date = new Date(d + "T00:00:00");
                return (
                  <div
                    key={d}
                    className={`text-center py-1.5 border-r border-slate-100 ${d === today ? "bg-yellow-400 text-slate-900" : "text-slate-700"}`}
                  >
                    <p className="text-[9px] uppercase">{date.toLocaleDateString("en-IN", { weekday: "short" })}</p>
                    <p className="text-xs font-medium">{date.getDate()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {typeList.map((type) => {
            const typeRooms = roomList.filter((r) => r.room_type_id === type.id);
            const unassigned = stays.filter(
              (b) => b.room_type_id === type.id && !b.room_id && b.status !== "checked_out",
            );
            if (typeRooms.length === 0 && unassigned.length === 0) return null;

            return (
              <div key={type.id}>
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-yellow-800 uppercase tracking-wider sticky left-0">
                  {type.name} · {typeRooms.length} room(s)
                </div>

                {typeRooms.map((room) => {
                  const roomStays = stays.filter((b) => b.room_id === room.id);
                  const roomBlocks = blockList.filter((b) => b.room_id === room.id);
                  return (
                    <div key={room.id} className="flex border-b border-slate-100">
                      <div className="w-36 shrink-0 px-3 py-1.5 sticky left-0 bg-white z-10 border-r border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{room.room_number}</p>
                        <p className="text-[10px] text-slate-500">{roomBoardLabel(room)}</p>
                      </div>
                      <div className="grid flex-1" style={grid}>
                        <DayCells roomTypeId={type.id} />
                        {roomBlocks.map((bl) => {
                          const s = span(bl.start_date, addDays(bl.end_date ?? addDays(end, 1), 1), start, days);
                          return s ? (
                            <div
                              key={bl.id}
                              title={`${bl.kind === "out_of_order" ? "Out of order" : "Out of service"}: ${bl.reason}`}
                              className="relative z-10 m-1 rounded-md border border-stone-300 bg-[repeating-linear-gradient(45deg,#e7e5e4,#e7e5e4_4px,#f5f5f4_4px,#f5f5f4_8px)] text-[10px] text-stone-700 px-1.5 flex items-center truncate"
                              style={{ gridColumn: `${s.from + 1} / ${s.to + 1}`, gridRow: 1 }}
                            >
                              {bl.reason}
                            </div>
                          ) : null;
                        })}
                        {roomStays.map((b) => (
                          <BookingBar key={b.id} b={b} />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {lanes(unassigned).map((lane, i) => (
                  <div key={`u-${i}`} className="flex border-b border-slate-100 bg-amber-50/40">
                    <div className="w-36 shrink-0 px-3 py-1.5 sticky left-0 bg-amber-50 z-10 border-r border-slate-100">
                      <p className="text-xs text-amber-800">Unassigned</p>
                    </div>
                    <div className="grid flex-1" style={grid}>
                      <DayCells roomTypeId={type.id} />
                      {lane.map((b) => (
                        <BookingBar key={b.id} b={b} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
