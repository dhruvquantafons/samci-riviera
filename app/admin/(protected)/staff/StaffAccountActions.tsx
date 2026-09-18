"use client";

import { useActionState, useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";
import type { Staff } from "../../../lib/types";
import { resetStaffPassword, deleteStaffMember, type ActionState } from "../../actions";
import { inputClass, secondaryButtonClass, Banner } from "../../components/ui";

/** Password reset and account removal, for someone other than yourself. */
export default function StaffAccountActions({ member }: { member: Staff }) {
  const [resetState, resetAction, resetting] = useActionState<ActionState, FormData>(
    resetStaffPassword,
    {},
  );
  const [deleteState, deleteAction, deleting] = useActionState<ActionState, FormData>(
    deleteStaffMember,
    {},
  );
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[11px] text-[#7a7771] hover:text-[#a88956] transition-colors cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Set a new password</span>
        </button>

        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (
              !confirm(
                `Remove ${member.full_name || member.email}'s account? Suspending them instead keeps their notes attributed.`,
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={member.id} />
          <button
            type="submit"
            disabled={deleting}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#b5afa6] hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? "Removing…" : "Remove account"}</span>
          </button>
        </form>
      </div>

      {open && (
        <form action={resetAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={member.id} />
          <label className="flex-1 min-w-[200px]">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-[#7a7771] font-semibold mb-1.5">
              New password
            </span>
            <input
              name="password"
              type="text"
              minLength={8}
              required
              autoComplete="off"
              className={inputClass}
            />
          </label>
          <button type="submit" disabled={resetting} className={secondaryButtonClass}>
            {resetting ? "Saving…" : "Set password"}
          </button>
        </form>
      )}

      <Banner error={resetState.error ?? deleteState.error} success={resetState.success} />
    </div>
  );
}
