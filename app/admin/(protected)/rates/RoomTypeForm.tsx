"use client";

import { useActionState } from "react";
import type { RoomType } from "../../../lib/types";
import { updateRoomType, type ActionState } from "../../actions";
import { Field, inputClass, buttonClass, Banner } from "../../components/ui";

export default function RoomTypeForm({ roomType }: { roomType: RoomType }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateRoomType,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={roomType.id} />

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-lg text-[#1c1b1a] font-medium">{roomType.name}</h2>
        <label className="flex items-center gap-2 text-xs text-[#5a5854]">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={roomType.is_active}
            className="accent-[#a88956] w-4 h-4"
          />
          <span>Show on website</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Display name">
          <input name="name" defaultValue={roomType.name} required className={inputClass} />
        </Field>
        <Field label="Nightly rate (₹)" hint="CPAI, inclusive of taxes">
          <input
            type="number"
            name="base_rate"
            min={0}
            step="1"
            defaultValue={Number(roomType.base_rate)}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Tagline">
        <input name="tagline" defaultValue={roomType.tagline} className={inputClass} />
      </Field>

      <Field label="Category" hint="Groups the filter tabs on the website.">
        <input name="category" defaultValue={roomType.category} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Size">
          <input name="size" defaultValue={roomType.size} className={inputClass} />
        </Field>
        <Field label="Occupancy">
          <input name="occupancy" defaultValue={roomType.occupancy} className={inputClass} />
        </Field>
        <Field label="View">
          <input name="view" defaultValue={roomType.view} className={inputClass} />
        </Field>
      </div>

      <Field label="Highlights" hint="One per line, up to six. The ticked list on the card.">
        <textarea
          name="highlights"
          rows={4}
          defaultValue={roomType.highlights.join("\n")}
          className={inputClass}
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          defaultValue={roomType.description}
          className={inputClass}
        />
      </Field>

      <Banner error={state.error} success={state.success} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
