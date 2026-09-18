"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "../lib/supabase/server";
import {
  requireStaff,
  requireAdmin,
  requireRatesAccess,
  requireBookingsAccess,
} from "../lib/auth";
import type { BookingStatus, StaffRole } from "../lib/types";
import { STAFF_ROLES } from "../lib/types";

export type ActionState = { error?: string; success?: string };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const num = (fd: FormData, key: string) => {
  const raw = str(fd, key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

// ── Bookings ────────────────────────────────────────────────────────────────

export async function createBooking(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireBookingsAccess();
  const supabase = await createClient();

  const contactName = str(formData, "contact_name");
  const checkIn = str(formData, "check_in");
  const checkOut = str(formData, "check_out");

  if (!contactName) return { error: "Guest name is required." };
  if (!checkIn || !checkOut) return { error: "Both dates are required." };
  if (checkOut <= checkIn) return { error: "Check-out must be after check-in." };

  // Reuse an existing guest when the email or phone already matches.
  let guestId: string | null = null;
  const email = str(formData, "contact_email");
  const phone = str(formData, "contact_phone");

  if (email || phone) {
    const query = supabase.from("guests").select("id").limit(1);
    const { data: existing } = email
      ? await query.ilike("email", email)
      : await query.eq("phone", phone);
    guestId = existing?.[0]?.id ?? null;
  }

  if (!guestId) {
    const { data: guest, error } = await supabase
      .from("guests")
      .insert({ full_name: contactName, email: email || null, phone: phone || null })
      .select("id")
      .single();
    if (error) return { error: error.message };
    guestId = guest.id;
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      guest_id: guestId,
      room_type_id: str(formData, "room_type_id") || null,
      check_in: checkIn,
      check_out: checkOut,
      adults: num(formData, "adults") ?? 2,
      children: num(formData, "children") ?? 0,
      rooms_count: num(formData, "rooms_count") ?? 1,
      status: (str(formData, "status") || "confirmed") as BookingStatus,
      source: str(formData, "source") || "phone",
      quoted_rate: num(formData, "quoted_rate"),
      total_amount: num(formData, "total_amount"),
      special_requests: str(formData, "special_requests"),
      contact_name: contactName,
      contact_email: email,
      contact_phone: phone,
      created_by: staff.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  redirect(`/admin/bookings/${data.id}`);
}

export async function updateBookingStatus(formData: FormData) {
  await requireBookingsAccess();
  const supabase = await createClient();
  const id = str(formData, "id");

  const { error } = await supabase
    .from("bookings")
    .update({ status: str(formData, "status") as BookingStatus })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

export async function updateBookingDetails(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireBookingsAccess();
  const supabase = await createClient();
  const id = str(formData, "id");

  const checkIn = str(formData, "check_in");
  const checkOut = str(formData, "check_out");
  if (checkOut <= checkIn) return { error: "Check-out must be after check-in." };

  const { error } = await supabase
    .from("bookings")
    .update({
      check_in: checkIn,
      check_out: checkOut,
      adults: num(formData, "adults") ?? 2,
      children: num(formData, "children") ?? 0,
      rooms_count: num(formData, "rooms_count") ?? 1,
      room_type_id: str(formData, "room_type_id") || null,
      room_id: str(formData, "room_id") || null,
      quoted_rate: num(formData, "quoted_rate"),
      total_amount: num(formData, "total_amount"),
      special_requests: str(formData, "special_requests"),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/bookings");
  return { success: "Booking updated." };
}

export async function addBookingNote(formData: FormData) {
  const staff = await requireBookingsAccess();
  const supabase = await createClient();

  const bookingId = str(formData, "booking_id");
  const body = str(formData, "body");
  if (!body) return;

  await supabase
    .from("booking_notes")
    .insert({ booking_id: bookingId, author_id: staff.id, body });

  revalidatePath(`/admin/bookings/${bookingId}`);
}

// ── Rooms ───────────────────────────────────────────────────────────────────

export async function createRoom(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRatesAccess();
  const supabase = await createClient();

  const roomNumber = str(formData, "room_number");
  const roomTypeId = str(formData, "room_type_id");
  if (!roomNumber) return { error: "Room number is required." };
  if (!roomTypeId) return { error: "Pick a room type." };

  const { error } = await supabase.from("rooms").insert({
    room_number: roomNumber,
    room_type_id: roomTypeId,
    floor: num(formData, "floor"),
    notes: str(formData, "notes"),
  });

  if (error) {
    return {
      error: error.code === "23505" ? `Room ${roomNumber} already exists.` : error.message,
    };
  }

  revalidatePath("/admin/rooms");
  return { success: `Room ${roomNumber} added.` };
}

export async function updateRoomStatus(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();

  await supabase
    .from("rooms")
    .update({ status: str(formData, "status") })
    .eq("id", str(formData, "id"));

  revalidatePath("/admin/rooms");
}

export async function deleteRoom(formData: FormData) {
  await requireRatesAccess();
  const supabase = await createClient();
  await supabase.from("rooms").delete().eq("id", str(formData, "id"));
  revalidatePath("/admin/rooms");
}

// ── Rates (admin only) ──────────────────────────────────────────────────────

/** URL-safe key derived from a display name. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** One highlight per line, trimmed, capped so a card cannot overflow. */
function parseHighlights(formData: FormData) {
  return str(formData, "highlights")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export async function createRoomType(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRatesAccess();
  const supabase = await createClient();

  const name = str(formData, "name");
  const rate = num(formData, "base_rate");

  if (!name) return { error: "Give the room type a name." };
  if (rate === null || rate < 0) return { error: "Enter a valid nightly rate." };

  const baseSlug = slugify(name);
  if (!baseSlug) return { error: "That name cannot be turned into a web address." };

  // Place it last in the running order.
  const { data: lastRow } = await supabase
    .from("room_types")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    name,
    category: slugify(str(formData, "category")) || baseSlug,
    tagline: str(formData, "tagline"),
    description: str(formData, "description"),
    size: str(formData, "size"),
    occupancy: str(formData, "occupancy"),
    view: str(formData, "view"),
    highlights: parseHighlights(formData),
    base_rate: rate,
    is_active: formData.get("is_active") === "on",
    sort_order: (lastRow?.sort_order ?? 0) + 1,
  };

  // Retry once with a numeric suffix if the slug is taken.
  let slug = baseSlug;
  let inserted = await supabase.from("room_types").insert({ ...payload, slug });

  if (inserted.error?.code === "23505") {
    slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    inserted = await supabase.from("room_types").insert({ ...payload, slug });
  }

  if (inserted.error) return { error: inserted.error.message };

  revalidatePath("/admin/rates");
  revalidatePath("/admin/rooms");
  // Rates and photography appear on several public pages, all statically
  // rendered. Revalidating the root layout refreshes every one of them;
  // revalidating "/" alone would leave /rooms serving a stale page.
  revalidatePath("/", "layout");
  return {
    success: `${name} created. Add a photo below, and it will appear on the website.`,
  };
}

/**
 * Removes a room type outright. Only possible while nothing references it —
 * Postgres restricts deletion once rooms exist, and we check bookings too so
 * history is never silently detached from its room type.
 */
export async function deleteRoomType(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRatesAccess();
  const supabase = await createClient();
  const id = str(formData, "id");

  const [{ count: roomCount }, { count: bookingCount }] = await Promise.all([
    supabase.from("rooms").select("id", { count: "exact", head: true }).eq("room_type_id", id),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("room_type_id", id),
  ]);

  if ((roomCount ?? 0) > 0) {
    return {
      error: `Still used by ${roomCount} room(s) in inventory. Reassign or remove them first.`,
    };
  }
  if ((bookingCount ?? 0) > 0) {
    return {
      error: `Used by ${bookingCount} booking(s). Untick "Show on website" to retire it instead.`,
    };
  }

  const { error } = await supabase.from("room_types").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/rates");
  // Rates and photography appear on several public pages, all statically
  // rendered. Revalidating the root layout refreshes every one of them;
  // revalidating "/" alone would leave /rooms serving a stale page.
  revalidatePath("/", "layout");
  return { success: "Room type deleted." };
}

export async function updateRoomType(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRatesAccess();
  const supabase = await createClient();

  const rate = num(formData, "base_rate");
  if (rate === null || rate < 0) return { error: "Enter a valid nightly rate." };

  const { error } = await supabase
    .from("room_types")
    .update({
      name: str(formData, "name"),
      category: slugify(str(formData, "category")) || "rooms",
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      size: str(formData, "size"),
      occupancy: str(formData, "occupancy"),
      view: str(formData, "view"),
      highlights: parseHighlights(formData),
      base_rate: rate,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", str(formData, "id"));

  if (error) return { error: error.message };

  revalidatePath("/admin/rates");
  // Rates and photography appear on several public pages, all statically
  // rendered. Revalidating the root layout refreshes every one of them;
  // revalidating "/" alone would leave /rooms serving a stale page.
  revalidatePath("/", "layout");
  return { success: "Rate updated. The public site now shows the new price." };
}

export async function updateExtraCharge(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRatesAccess();
  const supabase = await createClient();

  const amount = num(formData, "amount");
  if (amount === null || amount < 0) return { error: "Enter a valid amount." };

  const { error } = await supabase
    .from("extra_charges")
    .update({ label: str(formData, "label"), amount })
    .eq("id", str(formData, "id"));

  if (error) return { error: error.message };

  revalidatePath("/admin/rates");
  // Rates and photography appear on several public pages, all statically
  // rendered. Revalidating the root layout refreshes every one of them;
  // revalidating "/" alone would leave /rooms serving a stale page.
  revalidatePath("/", "layout");
  return { success: "Charge updated." };
}

// ── Room photography (admin only) ──────────────────────────────────────────

const ROOM_PHOTO_BUCKET = "room-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Extracts the object path from a public storage URL, or null if not ours. */
function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${ROOM_PHOTO_BUCKET}/`;
  const at = url.indexOf(marker);
  return at === -1 ? null : url.slice(at + marker.length);
}

export async function uploadRoomPhoto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRatesAccess();

  const id = str(formData, "id");
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { error: "Use a JPEG, PNG, WebP or AVIF image." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: "That image is larger than 5 MB. Please compress it first." };
  }

  const supabase = await createClient();

  const { data: roomType, error: lookupError } = await supabase
    .from("room_types")
    .select("slug, image")
    .eq("id", id)
    .single();

  if (lookupError || !roomType) return { error: "Room type not found." };

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  // Unique name per upload so CDN caches never serve the previous photo.
  const objectPath = `${roomType.slug}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(ROOM_PHOTO_BUCKET)
    .upload(objectPath, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const {
    data: { publicUrl },
  } = supabase.storage.from(ROOM_PHOTO_BUCKET).getPublicUrl(objectPath);

  const { error: saveError } = await supabase
    .from("room_types")
    .update({ image: publicUrl })
    .eq("id", id);

  if (saveError) {
    // Do not leave an orphaned object behind if the row could not be updated.
    await supabase.storage.from(ROOM_PHOTO_BUCKET).remove([objectPath]);
    return { error: saveError.message };
  }

  // Tidy up the photo this one replaced, if it lived in our bucket.
  const previous = storagePathFromUrl(roomType.image ?? "");
  if (previous && previous !== objectPath) {
    await supabase.storage.from(ROOM_PHOTO_BUCKET).remove([previous]);
  }

  revalidatePath("/admin/rates");
  // Rates and photography appear on several public pages, all statically
  // rendered. Revalidating the root layout refreshes every one of them;
  // revalidating "/" alone would leave /rooms serving a stale page.
  revalidatePath("/", "layout");
  return { success: "Photo updated. The website now shows the new image." };
}

// ── Staff (admin only) ──────────────────────────────────────────────────────

/**
 * Creates a login for a new staff member and fills in their details.
 *
 * Uses the service-role admin API because creating an auth user is privileged;
 * requireAdmin() above it means only an administrator can reach this. The
 * account is confirmed immediately, so the person can sign in with the
 * password set here and there is no invitation email to chase.
 */
export async function createStaffMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");
  const fullName = str(formData, "full_name");
  const role = str(formData, "role") as StaffRole;

  if (!fullName) return { error: "Enter the person's name." };
  if (!email || !email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "The password must be at least 8 characters." };
  if (!STAFF_ROLES.includes(role)) return { error: "Choose a role." };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY is not set, so accounts cannot be created from here.",
    };
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    const alreadyExists =
      createError.status === 422 || /already/i.test(createError.message);
    return {
      error: alreadyExists
        ? `An account already exists for ${email}.`
        : createError.message,
    };
  }

  // A database trigger creates the matching staff row; fill in the rest.
  const { error: detailsError } = await admin
    .from("staff")
    .update({
      full_name: fullName,
      job_title: str(formData, "job_title"),
      phone: str(formData, "phone"),
      role,
      is_active: true,
    })
    .eq("id", created.user.id);

  if (detailsError) return { error: detailsError.message };

  revalidatePath("/admin/staff");
  return { success: `${fullName} can now sign in with ${email}.` };
}

/**
 * Removes a staff member's login entirely. The staff row goes with it via the
 * cascade on auth.users. Suspending is usually the better move — it keeps the
 * person's history attached to the notes they wrote.
 */
export async function deleteStaffMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = str(formData, "id");

  if (id === admin.id) return { error: "You cannot delete your own account." };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not set." };
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath("/admin/staff");
  return { success: "Staff account removed." };
}

/** Sets a new password for someone who has lost theirs. */
export async function resetStaffPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = str(formData, "id");
  const password = str(formData, "password");

  if (password.length < 8) return { error: "The password must be at least 8 characters." };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not set." };
  }

  const { error } = await createAdminClient().auth.admin.updateUserById(id, {
    password,
  });
  if (error) return { error: error.message };

  return { success: "Password updated. Share it with them directly." };
}

export async function updateStaffMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const id = str(formData, "id");

  const fullName = str(formData, "full_name");
  if (!fullName) return { error: "Name is required." };

  // Details anyone may have; role and access only for other people, so an
  // admin cannot demote or suspend themselves and lock the team out.
  const details: Record<string, string | boolean> = {
    full_name: fullName,
    phone: str(formData, "phone"),
    job_title: str(formData, "job_title"),
  };

  if (id !== admin.id) {
    details.role = str(formData, "role");
    details.is_active = str(formData, "is_active") === "true";
  }

  const { error } = await supabase.from("staff").update(details).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/staff");
  return { success: "Staff member updated." };
}

// ── Session ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
