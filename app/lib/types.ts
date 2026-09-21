/**
 * Roles are rows in the `roles` table, each with a configurable permission
 * set (see permissions.ts). The key is stable; the display name is editable.
 */
export type StaffRole = string;

export interface Role {
  key: string;
  name: string;
  description: string;
  is_system: boolean;
  is_superuser: boolean;
  requires_2fa: boolean;
  sort_order: number;
}

export type BookingStatus =
  | "tentative"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show"
  | "waitlisted";

export type BookingSource =
  | "walk_in"
  | "phone"
  | "email"
  | "website"
  | "ota"
  | "travel_agent"
  | "corporate"
  | "mobile_app";

export type RoomStatus = "available" | "occupied" | "out_of_order" | "out_of_service";
export type HousekeepingStatus = "dirty" | "cleaning" | "clean" | "inspected";
export type BlockKind = "out_of_order" | "out_of_service";

export type RateType = "bar" | "corporate" | "package" | "promotional" | "group";
export type PenaltyKind = "none" | "first_night" | "full_stay" | "percent";
export type MealPlan = "EP" | "CP" | "MAP" | "AP";

export type PaymentMethod =
  | "cash"
  | "card"
  | "upi"
  | "bank_transfer"
  | "online_gateway"
  | "corporate_billing"
  | "ota_prepaid"
  | "wallet"
  | "other";

export type FolioKind = "room" | "fee" | "penalty" | "extra" | "payment" | "refund" | "adjustment";

export interface Staff {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  job_title: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  last_seen_at: string | null;
  password_changed_at: string;
  must_change_password: boolean;
  hk_zone_id?: string | null;
  on_duty?: boolean;
  employee_code?: string | null;
  department_id?: string | null;
  joining_date?: string | null;
  default_shift_id?: string | null;
  weekly_off?: number | null;
  address?: string;
  emergency_contact?: string;
  sessions_revoked_at?: string | null;
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
  weekend_rate: number | null;
  cleaning_minutes?: number | null;
  base_occupancy: number;
  max_adults: number;
  max_children: number;
  amenities: string[];
  gallery: string[];
  image: string;
  highlights: string[];
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export type ExtraChargeKind = "extra_adult" | "child_no_bed" | "meal" | "child_meal" | "other";

export interface ExtraCharge {
  id: string;
  label: string;
  amount: number;
  kind: ExtraChargeKind;
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
  housekeeping_status: HousekeepingStatus;
  housekeeping_updated_at: string | null;
  view: string;
  bed_configuration: string;
  max_adults: number | null;
  max_children: number | null;
  is_smoking: boolean;
  is_accessible: boolean;
  connecting_room_id: string | null;
  dnd?: boolean;
  dnd_updated_at?: string | null;
  last_deep_clean_on?: string | null;
  notes: string;
  created_at: string;
  room_types?: Pick<RoomType, "name" | "slug"> | null;
}

export interface RoomBlock {
  id: string;
  room_id: string;
  kind: BlockKind;
  start_date: string;
  end_date: string | null;
  reason: string;
  created_by: string | null;
  created_at: string;
  released_at: string | null;
  release_note: string;
  ticket_id?: string | null;
  rooms?: Pick<Room, "room_number"> | null;
  maintenance_tickets?: { id: string; reference: string; status: string } | null;
}

export interface Company {
  id: string;
  name: string;
  gstin: string;
  contact_name: string;
  email: string;
  phone: string;
  billing_address: string;
  credit_limit: number | null;
  payment_terms_days: number;
  notes: string;
  is_active: boolean;
}

export interface RatePlan {
  id: string;
  code: string;
  name: string;
  rate_type: RateType;
  description: string;
  meal_plan: MealPlan;
  adjustment_kind: "percent" | "amount";
  adjustment_value: number;
  room_type_ids: string[];
  company_id: string | null;
  inclusions: string[];
  is_refundable: boolean;
  free_cancellation_hours: number;
  cancellation_penalty: PenaltyKind;
  cancellation_penalty_percent: number;
  no_show_penalty: PenaltyKind;
  no_show_penalty_percent: number;
  deposit_percent: number;
  min_los: number | null;
  max_los: number | null;
  los_discount_min_nights: number | null;
  los_discount_percent: number | null;
  valid_from: string | null;
  valid_to: string | null;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface RateSeason {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  room_type_id: string | null;
  days_of_week: number[];
  adjustment_kind: "percent" | "amount" | "fixed";
  adjustment_value: number;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface RateRestriction {
  id: string;
  start_date: string;
  end_date: string;
  room_type_id: string | null;
  rate_plan_id: string | null;
  min_los: number | null;
  max_los: number | null;
  closed_to_arrival: boolean;
  closed_to_departure: boolean;
  stop_sell: boolean;
  note: string;
}

export interface ChannelAllocation {
  id: string;
  room_type_id: string;
  source: BookingSource;
  rooms: number;
}

export interface Guest {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string;
  city: string;
  country: string;
  nationality: string;
  tags: string[];
  notes: string;
  preferences: string;
  company_id: string | null;
  date_of_birth: string | null;
  anniversary: string | null;
  language: string;
  dietary: string;
  preferred_room_type_id: string | null;
  preferred_floor: number | null;
  blacklist_reason: string;
  marketing_opt_in: boolean;
  erased_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestStats {
  guest_id: string;
  stays: number;
  nights: number;
  last_stay: string | null;
  first_stay: string | null;
  next_arrival: string | null;
  cancellations: number;
  no_shows: number;
  total_spend: number;
}

export interface GuestFeedback {
  id: string;
  booking_id: string | null;
  guest_id: string | null;
  token: string | null;
  requested_at: string | null;
  submitted_at: string | null;
  overall: number | null;
  room: number | null;
  service: number | null;
  cleanliness: number | null;
  food: number | null;
  comment: string;
  source: "guest" | "desk";
  recorded_by: string | null;
  created_at: string;
}

/** Tags staff set by hand. Repeat Guest and Corporate are derived. */
export const MANUAL_GUEST_TAGS = ["VIP", "Blacklisted"] as const;
export const GUEST_TAGS = ["VIP", "Blacklisted", "Repeat Guest", "Corporate"] as const;
export type GuestTag = (typeof GUEST_TAGS)[number];

/** Every tag that applies, including the derived ones. */
export function guestTags(g: Pick<Guest, "tags" | "company_id">, stats?: Pick<GuestStats, "stays"> | null): GuestTag[] {
  const tags = new Set<GuestTag>((g.tags ?? []).filter((t): t is GuestTag => (GUEST_TAGS as readonly string[]).includes(t)));
  if ((stats?.stays ?? 0) >= 2) tags.add("Repeat Guest");
  if (g.company_id) tags.add("Corporate");
  return GUEST_TAGS.filter((t) => tags.has(t));
}

export const LANGUAGES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ur: "Urdu",
  ks: "Kashmiri",
  ar: "Arabic",
  fr: "French",
  de: "German",
  es: "Spanish",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
};

export type MessageTemplateKey = "request_received" | "confirmation" | "cancellation" | "final_bill";

export interface MessageTemplate {
  template: MessageTemplateKey;
  language: string;
  subject: string;
  body: string;
  footer: string;
  sms: string;
  updated_by?: string | null;
  updated_at?: string;
}

export interface NightRate {
  date: string;
  rate: number;
}

export interface Booking {
  id: string;
  reference: string;
  guest_id: string | null;
  room_type_id: string | null;
  room_id: string | null;
  rate_plan_id: string | null;
  company_id: string | null;
  group_id: string | null;
  split_from_id: string | null;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  rooms_count: number;
  status: BookingStatus;
  source: BookingSource;
  payment_method: PaymentMethod | null;
  promo_code: string;
  quoted_rate: number | null;
  total_amount: number | null;
  rate_breakdown: NightRate[];
  deposit_required: number;
  hold_until: string | null;
  preferred_floor: number | null;
  preferred_view: string;
  is_vip: boolean;
  eta: string | null;
  special_requests: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  cancelled_at: string | null;
  cancellation_reason: string;
  penalty_amount: number | null;
  penalty_waived: boolean;
  overbook_reason: string;
  confirmation_sent_at: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  guests?: (Pick<Guest, "id" | "full_name" | "email" | "phone"> & Partial<Pick<Guest, "tags" | "blacklist_reason">>) | null;
  room_types?: Pick<RoomType, "id" | "name"> | null;
  rooms?: Pick<Room, "id" | "room_number"> | null;
  rate_plans?: Pick<RatePlan, "id" | "code" | "name"> | null;
  companies?: Pick<Company, "id" | "name"> | null;
}

export interface BookingGroup {
  id: string;
  reference: string;
  name: string;
  company_id: string | null;
  rate_plan_id: string | null;
  organiser_name: string;
  organiser_phone: string;
  organiser_email: string;
  check_in: string;
  check_out: string;
  notes: string;
  created_at: string;
}

export interface FolioEntry {
  id: string;
  booking_id: string;
  folio_id: string;
  kind: FolioKind;
  description: string;
  stay_date: string | null;
  amount: number;
  tax_amount: number;
  tax_rate: number;
  method: PaymentMethod | null;
  reference: string;
  is_deposit: boolean;
  night_audit_date: string | null;
  voided_at: string | null;
  void_reason: string;
  created_at: string;
}

// ── Module 7: Billing & invoicing ───────────────────────────────────────────

export type FolioType = "master" | "split";

export interface Folio {
  id: string;
  booking_id: string;
  kind: FolioType;
  label: string;
  company_id: string | null;
  closed_at: string | null;
  created_at: string;
  companies?: Pick<Company, "id" | "name"> | null;
}

/** A charge as it was frozen onto an invoice. */
export interface InvoiceLine {
  date: string;
  description: string;
  kind: string;
  net: number;
  tax_rate: number;
  tax: number;
  total: number;
}

/** Charges grouped by tax rate — the rate-wise summary a GST invoice shows. */
export interface TaxBand {
  rate: number;
  net: number;
  tax: number;
}

export type InvoiceStatus = "issued" | "cancelled";

export interface Invoice {
  id: string;
  number: string;
  series: string;
  financial_year: string;
  seq: number;
  booking_id: string;
  folio_id: string;
  bill_to_name: string;
  bill_to_address: string;
  bill_to_gstin: string;
  company_id: string | null;
  place_of_supply: string;
  currency: string;
  net_total: number;
  tax_total: number;
  grand_total: number;
  tax_breakdown: TaxBand[];
  lines: InvoiceLine[];
  status: InvoiceStatus;
  cancelled_at: string | null;
  cancel_reason: string;
  issued_at: string;
  issued_by: string | null;
  bookings?: Pick<Booking, "reference" | "check_in" | "check_out"> | null;
}

export type PaymentTxStatus = "created" | "paid" | "cancelled" | "expired" | "failed" | "refunded";

export interface PaymentTransaction {
  id: string;
  booking_id: string;
  folio_id: string | null;
  provider: "razorpay";
  provider_link_id: string | null;
  provider_ref: string | null;
  short_url: string;
  purpose: "deposit" | "settlement";
  amount: number;
  currency: string;
  status: PaymentTxStatus;
  folio_entry_id: string | null;
  paid_at: string | null;
  expires_at: string | null;
  last_event: string;
  created_at: string;
}

export type RefundStatus = "pending" | "approved" | "rejected" | "processed" | "failed";

export interface RefundRequest {
  id: string;
  booking_id: string;
  folio_id: string | null;
  amount: number;
  reason: string;
  method: PaymentMethod;
  payment_tx_id: string | null;
  status: RefundStatus;
  requested_by: string | null;
  requested_at: string;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string;
  folio_entry_id: string | null;
  processed_at: string | null;
  error: string;
  bookings?: Pick<Booking, "reference" | "contact_name"> | null;
}

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending: "Awaiting approval",
  approved: "Approved",
  rejected: "Rejected",
  processed: "Refunded",
  failed: "Failed",
};

export interface GuestRequest {
  id: string;
  booking_id: string | null;
  room_id: string | null;
  kind: "wake_up_call" | "housekeeping" | "maintenance" | "message" | "request" | "complaint";
  description: string;
  due_at: string | null;
  status: "open" | "done" | "cancelled";
  created_at: string;
  completed_at: string | null;
}

export interface PropertySettings {
  name: string;
  legal_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  phone: string;
  email: string;
  gstin: string;
  currency: string;
  timezone: string;
  check_in_time: string;
  check_out_time: string;
  business_date: string;
  tax_inclusive: boolean;
  tax_slabs: unknown;
  tax_label: string;
  early_checkin_fee_type: "none" | "percent" | "flat";
  early_checkin_fee_value: number;
  late_checkout_fee_type: "none" | "percent" | "flat";
  late_checkout_fee_value: number;
  hold_hours: number;
  session_timeout_minutes: number;
  password_min_length: number;
  password_max_age_days: number;
  max_failed_logins: number;
  lockout_minutes: number;
  id_document_retention_days: number;
  hk_default_minutes: number;
  hk_deep_clean_days: number;
  mt_sla_low_hours: number;
  mt_sla_medium_hours: number;
  mt_sla_high_hours: number;
  mt_sla_urgent_hours: number;
  hr_geofence_lat: number | null;
  hr_geofence_lng: number | null;
  hr_geofence_radius_m: number;
  hr_require_geofence: boolean;
  hr_late_grace_minutes: number;
  default_language: string;
  languages: string[];
  invoice_prefix: string;
  invoice_terms: string;
  refund_approval_threshold: number;
  online_payments_enabled: boolean;
  updated_at: string;
}

export interface AuditEntry {
  id: number;
  occurred_at: string;
  actor_id: string | null;
  actor_name: string;
  module: string;
  table_name: string;
  record_id: string | null;
  action: string;
  summary: string;
  changed: string[];
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export type HkTaskKind = "checkout" | "deep_clean";
export type HkTaskStatus = "pending" | "in_progress" | "cleaned" | "inspected" | "cancelled";

export interface ChecklistEntry {
  item_id: string;
  label: string;
  category: "linen" | "amenities" | "minibar";
  done: boolean;
  qty: number;
}

export interface HousekeepingTask {
  id: string;
  room_id: string;
  task_date: string;
  kind: HkTaskKind;
  status: HkTaskStatus;
  priority: "normal" | "high";
  assigned_to: string | null;
  target_minutes: number;
  started_at: string | null;
  completed_at: string | null;
  inspected_at: string | null;
  inspection_note: string;
  failed_count: number;
  checklist: ChecklistEntry[];
  notes: string;
  created_at: string;
  rooms?: Pick<Room, "id" | "room_number" | "floor" | "status" | "housekeeping_status" | "dnd"> | null;
}

export interface HkZone {
  id: string;
  name: string;
  floors: number[];
  sort_order: number;
}

export interface HkChecklistItem {
  id: string;
  category: "linen" | "amenities" | "minibar";
  label: string;
  par_qty: number;
  sort_order: number;
  is_active: boolean;
}

export interface LostFoundItem {
  id: string;
  reference: string;
  room_id: string | null;
  location: string;
  found_on: string;
  description: string;
  category: "electronics" | "documents" | "jewellery" | "clothing" | "money" | "other";
  booking_id: string | null;
  storage_location: string;
  status: "stored" | "returned" | "disposed";
  returned_to: string;
  resolved_at: string | null;
  notes: string;
  created_at: string;
  rooms?: Pick<Room, "room_number"> | null;
  bookings?: Pick<Booking, "id" | "reference" | "contact_name" | "contact_phone"> | null;
}

export const HK_KIND_LABELS: Record<HkTaskKind, string> = {
  checkout: "Check-out clean",
  deep_clean: "Deep clean",
};

export const HK_STATUS_LABELS: Record<HkTaskStatus, string> = {
  pending: "To do",
  in_progress: "Cleaning",
  cleaned: "Awaiting inspection",
  inspected: "Ready for guest",
  cancelled: "Cancelled",
};

export const CHECKLIST_CATEGORY_LABELS = { linen: "Linen", amenities: "Amenities", minibar: "Minibar" } as const;

// ── Labels ─────────────────────────────────────────────────────────────────

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  tentative: "Tentative",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
  no_show: "No Show",
  waitlisted: "Waitlisted",
};

export const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  walk_in: "Walk-in",
  phone: "Phone",
  email: "Email",
  website: "Website",
  ota: "OTA",
  travel_agent: "Travel Agent",
  corporate: "Corporate",
  mobile_app: "Mobile App",
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  out_of_order: "Out of Order",
  out_of_service: "Out of Service",
};

export const HOUSEKEEPING_STATUS_LABELS: Record<HousekeepingStatus, string> = {
  dirty: "Dirty",
  cleaning: "Cleaning",
  clean: "Clean",
  inspected: "Inspected",
};

export const RATE_TYPE_LABELS: Record<RateType, string> = {
  bar: "Best Available Rate",
  corporate: "Corporate",
  package: "Package",
  promotional: "Promotional",
  group: "Group",
};

export const PENALTY_LABELS: Record<PenaltyKind, string> = {
  none: "No charge",
  first_night: "First night",
  full_stay: "Full stay",
  percent: "Percentage of stay",
};

export const MEAL_PLAN_LABELS: Record<MealPlan, string> = {
  EP: "Room only (EP)",
  CP: "Breakfast (CP)",
  MAP: "Breakfast + one meal (MAP)",
  AP: "All meals (AP)",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Credit / debit card",
  upi: "UPI",
  bank_transfer: "Bank transfer",
  online_gateway: "Online payment",
  corporate_billing: "Company bill (direct billing)",
  ota_prepaid: "Prepaid via OTA",
  wallet: "Wallet",
  other: "Other",
};

export const ID_TYPE_LABELS: Record<string, string> = {
  passport: "Passport",
  aadhaar: "Aadhaar",
  driving_licence: "Driving licence",
  voter_id: "Voter ID",
  pan: "PAN card",
  other: "Other",
};

export type GuestDocumentKind = "id_front" | "id_back" | "photo" | "visa" | "signature" | "other";

export interface GuestDocument {
  id: string;
  guest_id: string;
  booking_id: string | null;
  kind: GuestDocumentKind;
  storage_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
}

export const DOCUMENT_KIND_LABELS: Record<GuestDocumentKind, string> = {
  id_front: "ID — front",
  id_back: "ID — back",
  photo: "Guest photo",
  visa: "Visa",
  signature: "Signature",
  other: "Other document",
};

export const REQUEST_KIND_LABELS: Record<GuestRequest["kind"], string> = {
  wake_up_call: "Wake-up call",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  message: "Message",
  request: "Request",
  complaint: "Complaint",
};

/** Tailwind classes per booking status, used by the status pill. */
export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  tentative: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  checked_in: "bg-blue-50 text-blue-800 border-blue-200",
  checked_out: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-rose-50 text-rose-800 border-rose-200",
  no_show: "bg-orange-50 text-orange-800 border-orange-200",
  waitlisted: "bg-violet-50 text-violet-800 border-violet-200",
};

/** Statuses that hold inventory. Must match enforce_booking_inventory(). */
export const OCCUPYING_STATUSES: BookingStatus[] = ["tentative", "confirmed", "checked_in"];

/** The room board's combined view, in the SOW's terms. */
export function roomBoardLabel(room: Pick<Room, "status" | "housekeeping_status">) {
  if (room.status === "occupied") return "Occupied";
  if (room.status === "out_of_order") return "Out of Order";
  if (room.status === "out_of_service") return "Out of Service";
  return room.housekeeping_status === "dirty" || room.housekeeping_status === "cleaning"
    ? "Vacant Dirty"
    : "Vacant Clean";
}

// ── Module 11: Maintenance ──────────────────────────────────────────────────

export type MtPriority = "low" | "medium" | "high" | "urgent";
export type MtStatus = "open" | "in_progress" | "on_hold" | "resolved" | "cancelled";
export type MtSource = "staff" | "guest_request" | "room_block" | "preventive";
export type AssetCategory =
  | "hvac"
  | "electrical"
  | "plumbing"
  | "elevator"
  | "boiler"
  | "kitchen"
  | "laundry"
  | "furniture"
  | "it"
  | "safety"
  | "other";

export interface MaintenanceTicket {
  id: string;
  reference: string;
  title: string;
  description: string;
  room_id: string | null;
  asset_id: string | null;
  location: string;
  priority: MtPriority;
  status: MtStatus;
  source: MtSource;
  request_id: string | null;
  schedule_id: string | null;
  affects_room: boolean;
  assigned_to: string | null;
  assigned_at: string | null;
  reported_by: string | null;
  due_at: string;
  started_at: string | null;
  hold_reason: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_note: string;
  escalated_at: string | null;
  created_at: string;
  updated_at: string;
  rooms?: { room_number: string } | null;
  assets?: { code: string; name: string } | null;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: AssetCategory;
  room_id: string | null;
  location: string;
  make: string;
  model: string;
  serial_number: string;
  installed_on: string | null;
  warranty_until: string | null;
  notes: string;
  is_active: boolean;
  created_at: string;
  rooms?: { room_number: string } | null;
}

export interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  asset_id: string | null;
  room_id: string | null;
  location: string;
  interval_days: number;
  next_due_on: string;
  priority: MtPriority;
  assigned_to: string | null;
  is_active: boolean;
  last_generated_on: string | null;
  created_at: string;
  rooms?: { room_number: string } | null;
  assets?: { code: string; name: string } | null;
}

export interface MaintenancePhoto {
  id: string;
  ticket_id: string;
  storage_path: string;
  stage: "report" | "resolution";
  uploaded_by: string | null;
  uploaded_at: string;
}

export const MT_PRIORITIES: MtPriority[] = ["low", "medium", "high", "urgent"];

export const MT_PRIORITY_LABELS: Record<MtPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const MT_STATUS_LABELS: Record<MtStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  on_hold: "On hold",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

export const MT_SOURCE_LABELS: Record<MtSource, string> = {
  staff: "Reported by staff",
  guest_request: "Guest request",
  room_block: "Room taken out of order",
  preventive: "Preventive schedule",
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  hvac: "AC / heating",
  electrical: "Electrical",
  plumbing: "Plumbing",
  elevator: "Elevator",
  boiler: "Boiler / hot water",
  kitchen: "Kitchen equipment",
  laundry: "Laundry",
  furniture: "Furniture & fixtures",
  it: "IT & TV",
  safety: "Fire & safety",
  other: "Other",
};

// ── Module 12: HR ───────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  sort_order: number;
}

export type ShiftColor = "slate" | "yellow" | "orange" | "indigo" | "emerald" | "rose" | "sky" | "violet";

export interface ShiftType {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  start_time_2: string | null;
  end_time_2: string | null;
  color: ShiftColor;
  sort_order: number;
  is_active: boolean;
}

export interface StaffShift {
  id: string;
  staff_id: string;
  shift_date: string;
  shift_type_id: string | null;
  notes: string;
}

export type AttendanceMethod = "manual" | "self" | "mobile" | "biometric";

export interface AttendanceRecord {
  id: string;
  staff_id: string;
  work_date: string;
  clock_in: string;
  clock_out: string | null;
  method: AttendanceMethod;
  in_distance_m: number | null;
  out_distance_m: number | null;
  notes: string;
  recorded_by: string | null;
  created_at: string;
}

export type LeaveKind = "casual" | "sick" | "earned" | "unpaid" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: string;
  staff_id: string;
  kind: LeaveKind;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string;
  created_at: string;
}

export interface StaffFeedback {
  id: string;
  staff_id: string;
  booking_id: string | null;
  rating: number;
  comment: string;
  source: "guest" | "manager";
  recorded_by: string | null;
  created_at: string;
}

export const LEAVE_KIND_LABELS: Record<LeaveKind, string> = {
  casual: "Casual leave",
  sick: "Sick leave",
  earned: "Earned leave",
  unpaid: "Unpaid leave",
  other: "Other",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const ATTENDANCE_METHOD_LABELS: Record<AttendanceMethod, string> = {
  manual: "Manual entry",
  self: "Self clock-in",
  mobile: "Phone (location checked)",
  biometric: "Biometric device",
};

export const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
