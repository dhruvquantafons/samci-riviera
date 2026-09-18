"use client";

import { useActionState, useState } from "react";
import { UserPlus, RefreshCw, CheckCircle2 } from "lucide-react";
import { STAFF_ROLES, STAFF_ROLE_LABELS, STAFF_ROLE_DESCRIPTIONS } from "../../../lib/types";
import type { StaffRole } from "../../../lib/types";
import { createStaffMember, type ActionState } from "../../actions";
import { Field, inputClass, buttonClass, Banner } from "../../components/ui";

/** Readable, reasonably strong starting password the admin can pass on. */
function suggestPassword() {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("");
}

export default function AddStaffForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createStaffMember,
    {},
  );

  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("front_desk");
  // Bumping this remounts the form, which clears every field at once.
  const [formKey, setFormKey] = useState(0);

  const startAnother = () => {
    setPassword("");
    setRole("front_desk");
    setFormKey((n) => n + 1);
  };

  return (
    <details className="group">
      <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-medium text-[#a88956] hover:text-[#8f7343] transition-colors">
        <span className="w-6 h-6 rounded-full bg-[#f2ece2] flex items-center justify-center">
          <UserPlus className="w-3.5 h-3.5" />
        </span>
        <span>Add a staff member</span>
      </summary>

      {state.success ? (
        <div className="mt-5 space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="flex items-start gap-2 text-sm text-emerald-900">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{state.success}</span>
          </p>
          <p className="text-xs text-emerald-800 font-light">
            The password is not shown again — pass it on now. You can set a new one from
            their card below at any time.
          </p>
          <button type="button" onClick={startAnother} className={buttonClass}>
            Add another
          </button>
        </div>
      ) : (
      <form key={formKey} action={formAction} className="space-y-4 mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input name="full_name" required placeholder="Imran Ahmad" className={inputClass} />
          </Field>
          <Field label="Job title" hint="Free text — Waiter, Head Chef, Night Manager.">
            <input name="job_title" placeholder="Waiter" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email" hint="They sign in with this.">
            <input name="email" type="email" required autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" type="tel" className={inputClass} />
          </Field>
        </div>

        <Field label="Temporary password" hint="At least 8 characters. Share it with them directly; they can be given a new one later.">
          <div className="flex gap-2">
            <input
              name="password"
              type="text"
              required
              minLength={8}
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setPassword(suggestPassword())}
              title="Generate a password"
              className="px-3 rounded-lg border border-[#e5e0d8] text-[#5a5854] hover:border-[#a88956] hover:text-[#a88956] transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </Field>

        <Field label="Role" hint={STAFF_ROLE_DESCRIPTIONS[role]}>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className={inputClass}
          >
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {STAFF_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>

        <Banner error={state.error} />

        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
      )}
    </details>
  );
}
