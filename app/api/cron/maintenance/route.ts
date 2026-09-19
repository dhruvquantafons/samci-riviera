import { createServiceClient } from "../../../lib/supabase/server";
import { hasBearer } from "../../../lib/bearer";
import { escalateOverdueTickets } from "../../../lib/staff-alerts";
import { todayIn } from "../../../lib/dates";

/**
 * Scheduled maintenance job (SOW Module 11): escalates tickets past their
 * resolution target and raises preventive tickets that have fallen due.
 * Call it every 15–30 minutes from a scheduler (e.g. Vercel Cron, which
 * sends "Authorization: Bearer <CRON_SECRET>"). Disabled until CRON_SECRET
 * is set. Night audit and the maintenance board also do this work.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "The maintenance job is not configured." }, { status: 503 });
  }
  if (!hasBearer(request, secret)) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createServiceClient();
  const { data: settings } = await supabase.from("property_settings").select("timezone").maybeSingle();
  const { data: preventive, error } = await supabase.rpc("mt_generate_preventive", {
    p_date: todayIn(settings?.timezone ?? "Asia/Kolkata"),
  });
  if (error) return Response.json({ error: "Could not raise preventive tickets." }, { status: 500 });
  const escalated = await escalateOverdueTickets(supabase);

  return Response.json({ preventive_created: preventive ?? 0, escalated });
}
