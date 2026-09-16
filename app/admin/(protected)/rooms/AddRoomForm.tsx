"use client";

import { useActionState } from "react";
import type { RoomType } from "../../../lib/types";
import { createRoom, type ActionState } from "../../actions";
import { Field, inputClass, buttonClass, Banner } from "../../components/ui";

export default function AddRoomForm({ roomTypes }: { roomTypes: RoomType[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createRoom,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Room number">
          <input name="room_number" required placeholder="101" className={inputClass} />
        </Field>
        <Field label="Room type">
          <select name="room_type_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select…
            </option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Floor">
          <input type="number" name="floor" className={inputClass} />
        </Field>
      </div>

      <Field label="Notes">
        <input name="notes" className={inputClass} />
      </Field>

      <Banner error={state.error} success={state.success} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Adding…" : "Add room"}
      </button>
    </form>
  );
}
