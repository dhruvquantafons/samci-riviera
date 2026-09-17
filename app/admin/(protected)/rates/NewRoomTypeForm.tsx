"use client";

import { useActionState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { createRoomType, type ActionState } from "../../actions";
import { Field, inputClass, buttonClass, Banner } from "../../components/ui";

export default function NewRoomTypeForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createRoomType,
    {},
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful create so the next one starts blank.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <details className="group">
      <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-medium text-[#a88956] hover:text-[#8f7343] transition-colors">
        <span className="w-6 h-6 rounded-full bg-[#f2ece2] flex items-center justify-center">
          <Plus className="w-3.5 h-3.5 transition-transform group-open:rotate-45" />
        </span>
        <span>Add a new room type</span>
      </summary>

      <form ref={formRef} action={formAction} className="space-y-4 mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" hint="Shown as the card heading, e.g. Royal Suite.">
            <input name="name" required placeholder="Royal Suite" className={inputClass} />
          </Field>
          <Field label="Nightly rate (₹)" hint="CPAI, inclusive of taxes.">
            <input
              type="number"
              name="base_rate"
              min={0}
              step="1"
              required
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Category"
          hint="Groups the filter tabs on the website. Reuse an existing one, or leave blank to give it its own."
        >
          <input name="category" placeholder="suite" className={inputClass} />
        </Field>

        <Field label="Tagline" hint="One line under the name on the card.">
          <input
            name="tagline"
            placeholder="Our most spacious accommodation, overlooking the Jhelum"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Size">
            <input name="size" placeholder="600–750 sq. ft." className={inputClass} />
          </Field>
          <Field label="Occupancy">
            <input name="occupancy" placeholder="Up to 4 Guests" className={inputClass} />
          </Field>
          <Field label="View">
            <input name="view" placeholder="Panoramic River View" className={inputClass} />
          </Field>
        </div>

        <Field label="Highlights" hint="One per line, up to six. These become the ticked list on the card.">
          <textarea
            name="highlights"
            rows={4}
            placeholder={"Separate Living Room\nPrivate Balcony\nButler Service\n24/7 In-Room Dining"}
            className={inputClass}
          />
        </Field>

        <Field label="Description" hint="The longer paragraph in the room detail pop-up.">
          <textarea name="description" rows={3} className={inputClass} />
        </Field>

        <label className="flex items-center gap-2 text-xs text-[#5a5854]">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked
            className="accent-[#a88956] w-4 h-4"
          />
          <span>Show on the website straight away</span>
        </label>

        <Banner error={state.error} success={state.success} />

        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Creating…" : "Create room type"}
        </button>
      </form>
    </details>
  );
}
