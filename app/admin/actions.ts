"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { requireStaff, requireAdmin } from "../lib/auth";
import type { BookingStatus } from "../lib/types";

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
  const staff = await requireStaff();
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
  await requireStaff();
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
  await requireStaff();
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
  const staff = await requireStaff();
  const supabase = await createClient();

  const bookingId = str(formData, "booking_id");
  const body = str(formData, "body");
  if (!body) return;

  await supabase
    .from("booking_notes")
    .insert({ booking_id: bookingId, author_id: staff.id, body });

  revalidatePath(`/admin/bookings/${bookingId}`);
}

// ── Guests ──────────────────────────────────────────────────────────────────

export async function updateGuest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const supabase = await createClient();
  const id = str(formData, "id");

  const fullName = str(formData, "full_name");
  if (!fullName) return { error: "Name is required." };

  const tags = str(formData, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("guests")
    .update({
      full_name: fullName,
      email: str(formData, "email") || null,
      phone: str(formData, "phone") || null,
      address: str(formData, "address"),
      city: str(formData, "city"),
      country: str(formData, "country"),
      tags,
      notes: str(formData, "notes"),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/guests/${id}`);
  revalidatePath("/admin/guests");
  return { success: "Guest updated." };
}

// ── Rooms ───────────────────────────────────────────────────────────────────

export async function createRoom(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
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
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("rooms").delete().eq("id", str(formData, "id"));
  revalidatePath("/admin/rooms");
}

// ── Rates (admin only) ──────────────────────────────────────────────────────

export async function updateRoomType(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const rate = num(formData, "base_rate");
  if (rate === null || rate < 0) return { error: "Enter a valid nightly rate." };

  const { error } = await supabase
    .from("room_types")
    .update({
      name: str(formData, "name"),
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      size: str(formData, "size"),
      occupancy: str(formData, "occupancy"),
      view: str(formData, "view"),
      base_rate: rate,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", str(formData, "id"));

  if (error) return { error: error.message };

  revalidatePath("/admin/rates");
  revalidatePath("/");
  return { success: "Rate updated. The public site now shows the new price." };
}

export async function updateExtraCharge(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const amount = num(formData, "amount");
  if (amount === null || amount < 0) return { error: "Enter a valid amount." };

  const { error } = await supabase
    .from("extra_charges")
    .update({ label: str(formData, "label"), amount })
    .eq("id", str(formData, "id"));

  if (error) return { error: error.message };

  revalidatePath("/admin/rates");
  revalidatePath("/");
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
  await requireAdmin();

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
  revalidatePath("/");
  return { success: "Photo updated. The website now shows the new image." };
}

// ── Staff (admin only) ──────────────────────────────────────────────────────

export async function updateStaffMember(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const id = str(formData, "id");

  // Guard against an admin removing their own access and locking everyone out.
  if (id === admin.id) return;

  await supabase
    .from("staff")
    .update({
      role: str(formData, "role"),
      is_active: str(formData, "is_active") === "true",
    })
    .eq("id", id);

  revalidatePath("/admin/staff");
}

// ── Session ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
