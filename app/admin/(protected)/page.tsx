import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { createClient } from "../../lib/supabase/server";
import { requireStaff } from "../../lib/auth";
import type { Booking } from "../../lib/types";
import { OCCUPYING_STATUSES } from "../../lib/types";
import {
  PageHeader,
  Card,
  StatCard,
  StatusPill,
  EmptyState,
  fmtDate,
  secondaryButtonClass,
} from "../components/ui";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const staff = await requireStaff();
  const { denied } = await searchParams;
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [newCount, arrivalsToday, departuresToday, inHouse, recent, roomCount] =
    await Promise.all([
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("check_in", today)
        .in("status", ["new", "confirmed"]),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("check_out", today)
        .eq("status", "checked_in"),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "checked_in"),
      supabase
        .from("bookings")
        .select("*, guests(id, full_name, email, phone), room_types(id, name)")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("rooms").select("id", { count: "exact", head: true }),
    ]);

  const recentBookings = (recent.data ?? []) as Booking[];

  // Rooms committed to a stay that covers today.
  const { count: occupiedToday } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .lte("check_in", today)
    .gt("check_out", today)
    .in("status", OCCUPYING_STATUSES);

  const totalRooms = roomCount.count ?? 0;

  return (
    <>
      <PageHeader
        title={`Good day, ${staff.full_name.split(" ")[0] || "there"}`}
        description="Today at Hotel Samci Riviera."
      />

      {denied && (
        <div className="mb-6 flex items-start gap-2.5 text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
          <span>That section is restricted to administrators.</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="New requests"
          value={newCount.count ?? 0}
          href="/admin/bookings?status=new"
          hint="Awaiting a reply"
        />
        <StatCard
          label="Arriving today"
          value={arrivalsToday.count ?? 0}
          href="/admin/bookings"
        />
        <StatCard label="Departing today" value={departuresToday.count ?? 0} />
        <StatCard
          label="In house"
          value={inHouse.count ?? 0}
          hint={totalRooms ? `${occupiedToday ?? 0} of ${totalRooms} rooms committed` : undefined}
        />
      </div>

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
