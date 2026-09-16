import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import { requireStaff } from "../../../../lib/auth";
import type { Guest, Booking } from "../../../../lib/types";
import {
  Card,
  StatusPill,
  EmptyState,
  fmtDate,
  fmtMoney,
} from "../../../components/ui";
import EditGuestForm from "./EditGuestForm";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("guests").select("*").eq("id", id).single();
  if (!data) notFound();
  const guest = data as Guest;

  const { data: stays } = await supabase
    .from("bookings")
    .select("*, room_types(id, name)")
    .eq("guest_id", id)
    .order("check_in", { ascending: false });

  const bookings = (stays ?? []) as Booking[];
  const nightsStayed = bookings
    .filter((b) => b.status === "checked_out")
    .reduce(
      (total, b) =>
        total +
        Math.round(
          (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000,
        ),
      0,
    );

  return (
    <>
      <Link
        href="/admin/guests"
        className="inline-flex items-center gap-1.5 text-xs text-[#7a7771] hover:text-[#a88956] mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to guests
      </Link>

      <h1 className="font-serif text-2xl text-[#1c1b1a] font-medium mb-1">
        {guest.full_name}
      </h1>
      <p className="text-sm text-[#7a7771] font-light mb-6">
        {bookings.length} booking(s) · {nightsStayed} night(s) stayed
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-serif text-lg text-[#1c1b1a] font-medium mb-4">
              Stay history
            </h2>
            {bookings.length === 0 ? (
              <EmptyState message="No bookings recorded for this guest." />
            ) : (
              <ul className="divide-y divide-[#f0ece5] -mx-5">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-[#faf9f6] transition-colors"
                    >
                      <div className="flex-1 min-w-[150px]">
                        <p className="text-sm text-[#1c1b1a]">
                          {fmtDate(b.check_in)} → {fmtDate(b.check_out)}
                        </p>
                        <p className="text-[11px] text-[#9a9490] font-mono">{b.reference}</p>
                      </div>
                      <p className="text-xs text-[#5a5854]">{b.room_types?.name ?? "—"}</p>
                      <p className="text-xs text-[#5a5854]">{fmtMoney(b.total_amount)}</p>
                      <StatusPill status={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card className="p-5 h-fit">
          <h2 className="font-serif text-lg text-[#1c1b1a] font-medium mb-4">Details</h2>
          <EditGuestForm guest={guest} />
        </Card>
      </div>
    </>
  );
}
