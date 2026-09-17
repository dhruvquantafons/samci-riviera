"use client";

import { useActionState } from "react";
import type { Staff } from "../../../lib/types";
import { updateStaffMember, type ActionState } from "../../actions";
import { Field, inputClass, buttonClass, Banner } from "../../components/ui";

export default function StaffMemberForm({
  member,
  isSelf,
}: {
  member: Staff;
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateStaffMember,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={member.id} />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg text-[#1c1b1a] font-medium">
            {member.full_name || "Unnamed staff member"}
            {isSelf && (
              <span className="ml-2 text-[11px] text-[#a88956] font-sans font-normal">
                (you)
              </span>
            )}
          </h3>
          <p className="text-[11px] text-[#9a9490]">{member.email}</p>
        </div>

        <span
          className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${
            member.is_active
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {member.is_active ? "Active" : "Suspended"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Full name">
          <input name="full_name" defaultValue={member.full_name} required className={inputClass} />
        </Field>
        <Field label="Job title">
          <input
            name="job_title"
            defaultValue={member.job_title}
            placeholder="Front Office Manager"
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input name="phone" type="tel" defaultValue={member.phone} className={inputClass} />
        </Field>
      </div>

      {isSelf ? (
        <p className="text-[11px] text-[#9a9490] font-light bg-[#faf9f6] border border-[#e5e0d8] rounded-lg px-3 py-2">
          You can edit your own details, but not your own role or access — that
          prevents an administrator locking the whole team out by accident.
          Another administrator can change them for you.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Role" hint="Administrators additionally control rates, photos and staff.">
            <select name="role" defaultValue={member.role} className={inputClass}>
              <option value="front_desk">Front desk</option>
              <option value="admin">Administrator</option>
            </select>
          </Field>
          <Field label="Access" hint="Suspending takes effect on their next request.">
            <select
              name="is_active"
              defaultValue={String(member.is_active)}
              className={inputClass}
            >
              <option value="true">Active</option>
              <option value="false">Suspended</option>
            </select>
          </Field>
        </div>
      )}

      <Banner error={state.error} success={state.success} />

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}
