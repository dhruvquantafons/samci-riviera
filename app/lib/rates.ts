import { createPublicClient } from "./supabase/server";
import { hasSupabaseConfig } from "./supabase/config";
import { ROOMS_FALLBACK, EXTRA_CHARGES_FALLBACK } from "./rates-fallback";
import type { RoomType, ExtraCharge } from "./types";

export { hasSupabaseConfig };

/**
 * Tariff for the public site.
 *
 * Reads the rates an administrator set in the admin panel. If Supabase is not
 * configured yet, or the query fails, the published tariff is served from code
 * instead — the marketing site must never show an empty rate card.
 */
export async function getPublicRates(): Promise<{
  rooms: RoomType[];
  charges: ExtraCharge[];
  live: boolean;
}> {
  if (!hasSupabaseConfig()) {
    return { rooms: ROOMS_FALLBACK, charges: EXTRA_CHARGES_FALLBACK, live: false };
  }

  try {
    const supabase = createPublicClient();
    const [{ data: rooms }, { data: charges }] = await Promise.all([
      supabase
        .from("room_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("extra_charges")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
    ]);

    if (!rooms?.length) {
      return { rooms: ROOMS_FALLBACK, charges: EXTRA_CHARGES_FALLBACK, live: false };
    }

    return {
      rooms: rooms as RoomType[],
      charges: (charges ?? []) as ExtraCharge[],
      live: true,
    };
  } catch {
    return { rooms: ROOMS_FALLBACK, charges: EXTRA_CHARGES_FALLBACK, live: false };
  }
}
