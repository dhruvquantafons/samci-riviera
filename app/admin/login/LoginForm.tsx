"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import { Field, inputClass, buttonClass, Banner } from "../components/ui";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "That email and password combination was not recognised."
          : signInError.message,
      );
      setPending(false);
      return;
    }

    // Land back where they were headed, but only on an internal path.
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className={inputClass}
        />
      </Field>

      <Field label="Password">
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>

      <Banner error={error} />

      <button type="submit" disabled={pending} className={`${buttonClass} w-full flex items-center justify-center gap-2`}>
        <LogIn className="w-3.5 h-3.5" />
        <span>{pending ? "Signing in…" : "Sign in"}</span>
      </button>
    </form>
  );
}
