import { createClient } from "../../../lib/supabase/server";
import { requireAdmin } from "../../../lib/auth";
import type { RoomType, ExtraCharge } from "../../../lib/types";
import { PageHeader, Card } from "../../components/ui";
import RoomTypeForm from "./RoomTypeForm";
import RoomPhotoForm from "./RoomPhotoForm";
import ExtraChargeForm from "./ExtraChargeForm";

export default async function RatesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: roomTypes }, { data: charges }] = await Promise.all([
    supabase.from("room_types").select("*").order("sort_order"),
    supabase.from("extra_charges").select("*").order("sort_order"),
  ]);

  return (
    <>
      <PageHeader
        title="Rates"
        description="These values drive the tariff on the public website. Changes go live immediately."
      />

      <div className="space-y-6">
        {((roomTypes ?? []) as RoomType[]).map((rt) => (
          <Card key={rt.id} className="p-5 space-y-5">
            <RoomTypeForm roomType={rt} />
            <div className="pt-5 border-t border-[#f0ece5]">
              <RoomPhotoForm roomType={rt} />
            </div>
          </Card>
        ))}

        <Card className="p-5">
          <h2 className="font-serif text-lg text-[#1c1b1a] font-medium mb-1">
            Additional charges
          </h2>
          <p className="text-xs text-[#7a7771] font-light mb-4">
            Per person, per night. Shown beneath the room cards on the public site.
          </p>

          <div className="space-y-3">
            {((charges ?? []) as ExtraCharge[]).map((charge) => (
              <ExtraChargeForm key={charge.id} charge={charge} />
            ))}
          </div>
        </Card>

        <p className="text-xs text-[#7a7771] font-light bg-[#faf9f6] border border-[#e5e0d8] rounded-lg px-4 py-3">
          Room rates are published on the <strong className="font-medium">CPAI plan</strong> —
          accommodation with breakfast, inclusive of applicable taxes. Lunch and dinner are
          billed separately at the buffet rates above.
        </p>
      </div>
    </>
  );
}
