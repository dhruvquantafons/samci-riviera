import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Company,
  ExtraCharge,
  RatePlan,
  RateRestriction,
  RateSeason,
  RoomType,
} from "./types";

export interface PricingData {
  roomTypes: RoomType[];
  plans: RatePlan[];
  seasons: RateSeason[];
  restrictions: RateRestriction[];
  extraCharges: ExtraCharge[];
}

/**
 * Everything quoteStay() needs, loaded in one round of parallel queries.
 * Seasons and restrictions are limited to those that can still affect a
 * booking made today.
 */
export async function loadPricingData(
  supabase: SupabaseClient,
  options: { from?: string; publicOnly?: boolean } = {},
): Promise<PricingData> {
  const from = options.from ?? new Date(Date.now() - 400 * 86400000).toISOString().slice(0, 10);

  let plans = supabase.from("rate_plans").select("*").order("sort_order").order("name");
  let types = supabase.from("room_types").select("*").order("sort_order");
  if (options.publicOnly) {
    plans = plans.eq("is_active", true).eq("is_public", true);
    types = types.eq("is_active", true);
  }

  const [roomTypes, ratePlans, seasons, restrictions, extraCharges] = await Promise.all([
    types,
    plans,
    supabase.from("rate_seasons").select("*").gte("end_date", from).order("start_date"),
    supabase.from("rate_restrictions").select("*").gte("end_date", from).order("start_date"),
    supabase.from("extra_charges").select("*").order("sort_order"),
  ]);

  return {
    roomTypes: (roomTypes.data ?? []) as RoomType[],
    plans: (ratePlans.data ?? []) as RatePlan[],
    seasons: (seasons.data ?? []) as RateSeason[],
    restrictions: (restrictions.data ?? []) as RateRestriction[],
    extraCharges: (extraCharges.data ?? []) as ExtraCharge[],
  };
}

export async function loadCompanies(supabase: SupabaseClient): Promise<Company[]> {
  const { data } = await supabase.from("companies").select("*").eq("is_active", true).order("name");
  return (data ?? []) as Company[];
}
