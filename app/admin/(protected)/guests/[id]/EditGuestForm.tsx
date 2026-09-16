"use client";

import { useActionState } from "react";
import type { Guest } from "../../../../lib/types";
import { updateGuest, type ActionState } from "../../../actions";
import { Field, inputClass, buttonClass, Banner } from "../../../components/ui";

export default function EditGuestForm({ guest }: { guest: Guest }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateGuest,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={guest.id} />

      <Field label="Full name">
        <input name="full_name" defaultValue={guest.full_name} required className={inputClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" type="tel" defaultValue={guest.phone ?? ""} className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" defaultValue={guest.email ?? ""} className={inputClass} />
      </Field>
      <Field label="Address">
        <input name="address" defaultValue={guest.address} className={inputClass} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City">
          <input name="city" defaultValue={guest.city} className={inputClass} />
        </Field>
        <Field label="Country">
          <input name="country" defaultValue={guest.country} className={inputClass} />
        </Field>
      </div>
      <Field label="Tags" hint="Comma separated, e.g. corporate, repeat, VIP">
        <input name="tags" defaultValue={guest.tags.join(", ")} className={inputClass} />
      </Field>
      <Field label="Notes">
        <textarea name="notes" rows={4} defaultValue={guest.notes} className={inputClass} />
      </Field>

      <Banner error={state.error} success={state.success} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Save guest"}
      </button>
    </form>
  );
}
