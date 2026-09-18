export type StaffRole = "admin" | "manager" | "front_desk" | "housekeeping";

/**
 * Roles are permission tiers, not job titles. Someone's actual job — Waiter,
 * Head Chef, Night Manager — lives in staff.job_title, which is free text.
 */
export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  front_desk: "Front Desk",
  housekeeping: "Housekeeping",
};

export const STAFF_ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  admin: "Everything, including rates, room photos and staff accounts.",
  manager: "Bookings, rooms, rates and photos. Cannot manage staff accounts.",
  front_desk: "Bookings and rooms.",
  housekeeping: "Rooms only.",
};

/** Order shown in pickers, most privileged first. */
export const STAFF_ROLES: StaffRole[] = [
  "admin",
  "manager",
  "front_desk",
  "housekeeping",
];

export const canManageStaff = (role: StaffRole) => role === "admin";
export const canManageRates = (role: StaffRole) =>
  role === "admin" || role === "manager";
export const canManageBookings = (role: StaffRole) =>
  role === "admin" || role === "manager" || role === "front_desk";
/** Every active staff member can see the rooms board. */
export const canManageRooms = () => true;

export type BookingStatus =
  | "new"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";

export type BookingSource = "website" | "phone" | "walk_in" | "email" | "ota";

export type RoomStatus = "available" | "occupied" | "maintenance" | "out_of_service";

export interface Staff {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  job_title: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
}

export interface RoomType {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  size: string;
  occupancy: string;
  view: string;
  base_rate: number;
  image: string;
  highlights: string[];
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface ExtraCharge {
  id: string;
  label: string;
  amount: number;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  floor: number | null;
  status: RoomStatus;
  notes: string;
  created_at: string;
  room_types?: Pick<RoomType, "name" | "slug"> | null;
}

export interface Guest {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string;
  city: string;
  country: string;
  tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  reference: string;
  guest_id: string | null;
  room_type_id: string | null;
  room_id: string | null;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  rooms_count: number;
  status: BookingStatus;
  source: BookingSource;
  promo_code: string;
  quoted_rate: number | null;
  total_amount: number | null;
  special_requests: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  guests?: Pick<Guest, "id" | "full_name" | "email" | "phone"> | null;
  room_types?: Pick<RoomType, "id" | "name"> | null;
  rooms?: Pick<Room, "id" | "room_number"> | null;
}

export interface BookingNote {
  id: string;
  booking_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
  staff?: Pick<Staff, "full_name" | "email"> | null;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  website: "Website",
  phone: "Phone",
  walk_in: "Walk-in",
  email: "Email",
  ota: "Travel Agent / OTA",
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Maintenance",
  out_of_service: "Out of Service",
};

/** Tailwind classes per booking status, used by the status pill. */
export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  new: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  checked_in: "bg-blue-50 text-blue-800 border-blue-200",
  checked_out: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-rose-50 text-rose-800 border-rose-200",
  no_show: "bg-orange-50 text-orange-800 border-orange-200",
};

/** Statuses that occupy a room for availability purposes. */
export const OCCUPYING_STATUSES: BookingStatus[] = ["new", "confirmed", "checked_in"];
