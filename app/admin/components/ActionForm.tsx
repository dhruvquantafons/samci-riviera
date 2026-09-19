"use client";

import { useActionState } from "react";
import type { ActionState } from "../form-utils";
import { Banner, buttonClass } from "./ui";
import { keepFormOnSubmit } from "./useKeepForm";

/**
 * A form bound to a server action that returns ActionState. Server Components
 * pass the action and their inputs as children, so most admin forms need no
 * client component of their own.
 */
export default function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  className = "space-y-4",
  submitClassName = buttonClass,
  confirmMessage,
  overbookHint,
  footer,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
  submitClassName?: string;
  /** Ask before submitting, for irreversible actions. */
  confirmMessage?: string;
  /** Shown when the database refuses for lack of rooms. */
  overbookHint?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className={className} onSubmit={keepFormOnSubmit(formAction, confirmMessage)}>
      {children}
      <Banner error={state.error} success={state.success} />
      {state.overbooked && overbookHint}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={submitClassName}>
          {pending ? pendingLabel : submitLabel}
        </button>
        {footer}
      </div>
    </form>
  );
}
