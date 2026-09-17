import Link from "next/link";
import { ArrowRight, AlertTriangle, LogIn, LogOut, TrendingUp } from "lucide-react";
import { createClient } from "../../lib/supabase/server";
import { requireStaff } from "../../lib/auth";
import type { Booking, Room, RoomStatus } from "../../lib/types";
import { OCCUPYING_STATUSES, ROOM_STATUS_LABELS } from "../../lib/types";
import {
  PageHeader,
  Card,
  StatCard,
  StatusPill,
  EmptyState,
  fmtDate,
  fmtMoney,
  nightsBetween,
  secondaryButtonClass,
} from "../components/ui";

const ROOM_STATUS_TONE: Record<RoomStatus, string> = {
  available: "text-emerald-700",
  occupied: "text-blue-700",
  maintenance: "text-amber-700",
  out_of_service: "text-rose-700",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const staff = await requireStaff();
  const { denied } = await searchParams;
  const supabase = await createClient();

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const monthStart = today.slice(0, 8) + "01";

  const weekAheadDate = new Date(now);
  weekAheadDate.setDate(now.getDate() + 7);
  const weekAhead = weekAheadDate.toISOString().split("T")[0];

  const [
    newCount,
    arrivals,
    departures,
    inHouse,
    recent,
    rooms,
    occupied,
    monthBookings,
    upcoming,
    unassigned,
  ] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "new"),
    // Today's arrivals, listed rather than just counted.
    supabase
      .from("bookings")
      .select("*, guests(id, full_name, email, phone), room_types(id, name), rooms(id, room_number)")
      .eq("check_in", today)
      .in("status", ["new", "confirmed"])
      .order("created_at"),
    supabase
      .from("bookings")
      .select("*, guests(id, full_name, email, phone), rooms(id, room_number)")
      .eq("check_out", today)
      .eq("status", "checked_in")
      .order("created_at"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "checked_in"),
    supabase
      .from("bookings")
      .select("*, guests(id, full_name, email, phone), room_types(id, name)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("rooms").select("id, status"),
    supabase
      .from("bookings")
      .select("rooms_count")
      .lte("check_in", today)
      .gt("check_out", today)
      .in("status", OCCUPYING_STATUSES),
    // Revenue and volume for the month so far.
    supabase
      .from("bookings")
      .select("total_amount")
      .gte("check_in", monthStart)
      .not("status", "in", "(cancelled,no_show)"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gt("check_in", today)
      .lte("check_in", weekAhead)
      .in("status", ["new", "confirmed"]),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .is("room_id", null)
      .in("status", ["confirmed", "checked_in"]),
  ]);

  const arrivalList = (arrivals.data ?? []) as Booking[];
  const departureList = (departures.data ?? []) as Booking[];
  const recentBookings = (recent.data ?? []) as Booking[];
  const roomList = (rooms.data ?? []) as Pick<Room, "id" | "status">[];

  const sellableRooms = roomList.filter((r) => r.status !== "out_of_service").length;
  const roomsCommitted = (occupied.data ?? []).reduce(
    (sum, b) => sum + ((b as { rooms_count: number }).rooms_count ?? 0),
    0,
  );
  const occupancyRate =
    sellableRooms > 0 ? Math.round((roomsCommitted / sellableRooms) * 100) : null;

  const monthRows = (monthBookings.data ?? []) as { total_amount: number | null }[];
  const monthRevenue = monthRows.reduce((sum, b) => sum + Number(b.total_amount ?? 0), 0);

  const statusCounts = roomList.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  const monthLabel = new Date(today + "T00:00:00").toLocaleDateString("en-IN", {
    month: "long",
  });

  return (
    <>
      <PageHeader
        title={`Good day, ${staff.full_name.split(" ")[0] || "there"}`}
        description={now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      />

      {denied && (
        <div className="mb-6 flex items-start gap-2.5 text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
          <span>That section is restricted to administrators.</span>
        </div>
      )}

      {/* Things needing attention */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="New requests"
          value={newCount.count ?? 0}
          href="/admin/bookings?status=new"
          hint="Awaiting a reply"
        />
        <StatCard label="Arriving today" value={arrivalList.length} hint="To check in" />
        <StatCard label="Departing today" value={departureList.length} hint="To check out" />
        <StatCard
          label="In house"
          value={inHouse.count ?? 0}
          href="/admin/bookings?status=checked_in"
          hint="Currently staying"
        />
      </div>

      {/* The shape of the business */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Occupancy today"
          value={occupancyRate === null ? "—" : `${occupancyRate}%`}
          href="/admin/rooms"
          hint={
            sellableRooms > 0
              ? `${roomsCommitted} of ${sellableRooms} rooms`
              : "Add rooms to inventory"
          }
        />
        <StatCard
          label="Rooms free now"
          value={sellableRooms > 0 ? Math.max(0, sellableRooms - roomsCommitted) : "—"}
          href="/admin/rooms"
        />
        <StatCard
          label={`${monthLabel} revenue`}
          value={fmtMoney(monthRevenue)}
          hint={`${monthRows.length} booking(s) this month`}
        />
        <StatCard
          label="Next 7 days"
          value={upcoming.count ?? 0}
          href="/admin/bookings"
          hint="Arrivals booked"
        />
      </div>

      {(unassigned.count ?? 0) > 0 && (
        <Link
          href="/admin/bookings?status=confirmed"
          className="flex items-start gap-2.5 text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-4 py-3 mb-8 hover:border-amber-300 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
          <span>
            <strong className="font-medium">{unassigned.count}</strong> confirmed or in-house
            booking(s) have no room assigned. A room must be assigned before check-in marks
            it occupied.
          </span>
        </Link>
      )}

      {/* Today's movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MovementList
          title="Arrivals today"
          icon={<LogIn className="w-4 h-4 text-emerald-600" />}
          bookings={arrivalList}
          empty="No arrivals scheduled for today."
          showRoom
        />
        <MovementList
          title="Departures today"
          icon={<LogOut className="w-4 h-4 text-blue-600" />}
          bookings={departureList}
          empty="No departures scheduled for today."
          showRoom
        />
      </div>

      {/* Room status breakdown */}
      {roomList.length > 0 && (
        <Card className="p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#a88956]" />
            <h2 className="font-serif text-lg text-[#1c1b1a] font-medium">Room status</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(Object.keys(ROOM_STATUS_LABELS) as RoomStatus[]).map((status) => (
              <div key={status}>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#9a9490] font-semibold">
                  {ROOM_STATUS_LABELS[status]}
                </p>
                <p
                  className={`font-serif text-2xl font-medium mt-1 ${ROOM_STATUS_TONE[status]}`}
                >
                  {statusCounts[status] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Latest bookings */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0ece5]">
          <h2 className="font-serif text-lg text-[#1c1b1a] font-medium">Latest bookings</h2>
          <Link href="/admin/bookings" className={secondaryButtonClass}>
            <span className="flex items-center gap-1.5">
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <EmptyState message="No bookings yet. They will appear here as requests arrive." />
        ) : (
          <ul className="divide-y divide-[#f0ece5]">
            {recentBookings.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/bookings/${b.id}`}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-[#faf9f6] transition-colors"
                >
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-sm font-medium text-[#1c1b1a]">
                      {b.guests?.full_name || b.contact_name || "Unnamed guest"}
                    </p>
                    <p className="text-[11px] text-[#9a9490] font-mono">{b.reference}</p>
                  </div>
                  <p className="text-xs text-[#5a5854] whitespace-nowrap">
                    {fmtDate(b.check_in)} → {fmtDate(b.check_out)}
                    <span className="block text-[11px] text-[#9a9490]">
                      {nightsBetween(b.check_in, b.check_out)} night(s)
                    </span>
                  </p>
                  <StatusPill status={b.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function MovementList({
  title,
  icon,
  bookings,
  empty,
  showRoom,
}: {
  title: string;
  icon: React.ReactNode;
  bookings: Booking[];
  empty: string;
  showRoom?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#f0ece5]">
        {icon}
        <h2 className="font-serif text-lg text-[#1c1b1a] font-medium">{title}</h2>
        <span className="ml-auto text-xs text-[#9a9490]">{bookings.length}</span>
      </div>

      {bookings.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[#9a9490] font-light text-center">{empty}</p>
      ) : (
        <ul className="divide-y divide-[#f0ece5]">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/bookings/${b.id}`}
                className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-[#faf9f6] transition-colors"
              >
                <div className="flex-1 min-w-[140px]">
                  <p className="text-sm font-medium text-[#1c1b1a]">
                    {b.guests?.full_name || b.contact_name || "Unnamed guest"}
                  </p>
                  <p className="text-[11px] text-[#9a9490]">
                    {b.adults + b.children} guest(s) · {b.rooms_count} room(s)
                  </p>
                </div>

                {showRoom && (
                  <span
                    className={`text-xs whitespace-nowrap ${
                      b.rooms?.room_number ? "text-[#5a5854]" : "text-amber-700"
                    }`}
                  >
                    {b.rooms?.room_number ?? "No room"}
                  </span>
                )}

                <StatusPill status={b.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
