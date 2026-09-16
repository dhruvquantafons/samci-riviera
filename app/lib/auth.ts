import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { hasSupabaseConfig } from "./supabase/config";
import type { Staff } from "./types";

/**
 * Resolves the signed-in staff member, or null. Does not redirect.
 *
 * Wrapped in React's cache() so the layout and the page it renders share a
 * single lookup per request. Without this, each navigation paid for two
 * round-trips to Supabase Auth and two staff queries instead of one each.
 */
export const getStaff = cache(async (): Promise<Staff | null> => {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("staff")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!data || !data.is_active) return null;
  return data as Staff;
});

/**
 * Guard for admin pages and every server action. proxy.ts already redirects
 * unauthenticated traffic, but authorization is re-checked here so a missed
 * matcher can never expose data.
 */
export async function requireStaff(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}

/** Same, but for admin-only work such as editing rates or managing users. */
export async function requireAdmin(): Promise<Staff> {
  const staff = await requireStaff();
  if (staff.role !== "admin") redirect("/admin?denied=1");
  return staff;
}
