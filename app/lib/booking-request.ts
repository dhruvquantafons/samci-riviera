"use server";

import { createServiceClient } from "./supabase/server";
import { hasSupabaseConfig } from "./supabase/config";

export type RequestState = { error?: string; success?: string };

/**
 * Accepts a booking enquiry from the public website.
 *
 * Runs with the service role key because the visitor is anonymous and RLS
 * deliberately forbids the anon key from writing bookings. Everything that
 * reaches the database here is treated as untrusted input: only the specific
 * fields below are written, and status/source are fixed server-side so a
 * crafted request cannot mark itself confirmed.
 */
export async function submitBookingRequest(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const name = get("contact_name");
  const phone = get("contact_phone");
  const email = get("contact_email");
  const checkIn = get("check_in");
  const checkOut = get("check_out");

  if (!name) return { error: "Please tell us your name." };
  if (!phone && !email) return { error: "Please leave a phone number or an email address." };
  if (!checkIn || !checkOut) return { error: "Please choose your dates." };
  if (checkOut <= checkIn) return { error: "Check-out must be after check-in." };

  if (!hasSupabaseConfig() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error:
        "Online requests are not available right now. Please call us on +91 90700 90713.",
    };
  }

  const toInt = (k: string, fallback: number) => {
    const n = Number(get(k));
    return Number.isInteger(n) && n >= 0 && n <= 50 ? n : fallback;
  };

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("bookings").insert({
      check_in: checkIn,
      check_out: checkOut,
      adults: Math.max(1, toInt("adults", 2)),
      children: toInt("children", 0),
      rooms_count: Math.max(1, toInt("rooms_count", 1)),
      room_type_id: get("room_type_id") || null,
      promo_code: get("promo_code").slice(0, 40),
      special_requests: get("special_requests").slice(0, 2000),
      contact_name: name.slice(0, 200),
      contact_email: email.slice(0, 200),
      contact_phone: phone.slice(0, 50),
      status: "new",
      source: "website",
    });

    if (error) {
      return {
        error: "We could not send that request. Please call us on +91 90700 90713.",
      };
    }

    return {
      success:
        "Thank you — we have your request. Our front desk will confirm availability with you shortly.",
    };
  } catch {
    return {
      error: "We could not send that request. Please call us on +91 90700 90713.",
    };
  }
}
