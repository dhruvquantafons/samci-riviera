"use client";

import { useActionState } from "react";
import type { RoomType } from "../../../../lib/types";
import { BOOKING_SOURCE_LABELS, BOOKING_STATUS_LABELS } from "../../../../lib/types";
import { createBooking, type ActionState } from "../../../actions";
import { Field, inputClass, buttonClass, Banner } from "../../../components/ui";

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

export default function NewBookingForm({ roomTypes }: { roomTypes: RoomType[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createBooking,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <fieldset className="space-y-4">
        <legend className="text-[10px] uppercase tracking-[0.18em] text-[#a88956] font-semibold mb-2">
          Guest
        </legend>
        <Field label="Full name">
          <input name="contact_name" required className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone">
            <input name="contact_phone" type="tel" className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="contact_email" type="email" className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4 pt-2 border-t border-[#f0ece5]">
        <legend className="text-[10px] uppercase tracking-[0.18em] text-[#a88956] font-semibold mb-2 pt-3">
          Stay
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Check in">
            <input type="date" name="check_in" defaultValue={today} required className={inputClass} />
          </Field>
          <Field label="Check out">
            <input type="date" name="check_out" defaultValue={tomorrow} required className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Adults">
            <input type="number" name="adults" min={1} defaultValue={2} className={inputClass} />
          </Field>
          <Field label="Children">
            <input type="number" name="children" min={0} defaultValue={0} className={inputClass} />
          </Field>
          <Field label="Rooms">
            <input type="number" name="rooms_count" min={1} defaultValue={1} className={inputClass} />
          </Field>
        </div>

        <Field label="Room type">
          <select name="room_type_id" className={inputClass} defaultValue="">
            <option value="">Not decided</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} — ₹{Number(rt.base_rate).toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nightly rate (₹)">
            <input type="number" name="quoted_rate" min={0} step="0.01" className={inputClass} />
          </Field>
          <Field label="Total amount (₹)">
            <input type="number" name="total_amount" min={0} step="0.01" className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4 pt-2 border-t border-[#f0ece5]">
        <legend className="text-[10px] uppercase tracking-[0.18em] text-[#a88956] font-semibold mb-2 pt-3">
          Booking
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Source">
            <select name="source" defaultValue="phone" className={inputClass}>
              {Object.entries(BOOKING_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="confirmed" className={inputClass}>
              {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Special requests">
          <textarea name="special_requests" rows={3} className={inputClass} />
        </Field>
      </fieldset>

      <Banner error={state.error} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Creating…" : "Create booking"}
      </button>
    </form>
  );
}
