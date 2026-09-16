"use client";

import { useActionState } from "react";
import type { Booking, RoomType, Room } from "../../../../lib/types";
import { updateBookingDetails, type ActionState } from "../../../actions";
import { Field, inputClass, buttonClass, Banner } from "../../../components/ui";

export default function EditBookingForm({
  booking,
  roomTypes,
  rooms,
}: {
  booking: Booking;
  roomTypes: RoomType[];
  rooms: Room[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateBookingDetails,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={booking.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Check in">
          <input type="date" name="check_in" defaultValue={booking.check_in} required className={inputClass} />
        </Field>
        <Field label="Check out">
          <input type="date" name="check_out" defaultValue={booking.check_out} required className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Adults">
          <input type="number" name="adults" min={1} defaultValue={booking.adults} className={inputClass} />
        </Field>
        <Field label="Children">
          <input type="number" name="children" min={0} defaultValue={booking.children} className={inputClass} />
        </Field>
        <Field label="Rooms">
          <input type="number" name="rooms_count" min={1} defaultValue={booking.rooms_count} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Room type">
          <select name="room_type_id" defaultValue={booking.room_type_id ?? ""} className={inputClass}>
            <option value="">Not set</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Assigned room">
          <select name="room_id" defaultValue={booking.room_id ?? ""} className={inputClass}>
            <option value="">Unassigned</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_number}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nightly rate (₹)">
          <input
            type="number"
            name="quoted_rate"
            min={0}
            step="0.01"
            defaultValue={booking.quoted_rate ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Total amount (₹)">
          <input
            type="number"
            name="total_amount"
            min={0}
            step="0.01"
            defaultValue={booking.total_amount ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Special requests">
        <textarea
          name="special_requests"
          rows={3}
          defaultValue={booking.special_requests}
          className={inputClass}
        />
      </Field>

      <Banner error={state.error} success={state.success} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
