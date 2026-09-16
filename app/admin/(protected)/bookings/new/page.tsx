import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import { requireStaff } from "../../../../lib/auth";
import type { RoomType } from "../../../../lib/types";
import { Card } from "../../../components/ui";
import NewBookingForm from "./NewBookingForm";

export default async function NewBookingPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: roomTypes } = await supabase
    .from("room_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-xs text-[#7a7771] hover:text-[#a88956] mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to bookings
      </Link>

      <h1 className="font-serif text-2xl text-[#1c1b1a] font-medium mb-1">New booking</h1>
      <p className="text-sm text-[#7a7771] font-light mb-6">
        For reservations taken by phone, email, or at the desk. An existing guest with a
        matching email or phone is linked automatically.
      </p>

      <Card className="p-5 max-w-3xl">
        <NewBookingForm roomTypes={(roomTypes ?? []) as RoomType[]} />
      </Card>
    </>
  );
}
