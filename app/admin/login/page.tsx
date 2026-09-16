import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import SetupNotice from "../components/SetupNotice";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  await connection();
  if (!hasSupabaseConfig()) return <SetupNotice />;

  return (
    <main className="min-h-screen bg-[#141312] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-serif text-2xl text-[#e6d7c3] font-medium tracking-[0.18em] uppercase">
            Samci Riviera
          </p>
          <p className="text-[10px] tracking-[0.3em] text-[#9a9490] uppercase mt-1">
            Reservations Desk
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e0d8] p-6 shadow-2xl">
          <Suspense
            fallback={<p className="text-sm text-[#9a9490] text-center py-8">Loading…</p>}
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-[11px] text-[#6d6862] mt-6 font-light">
          Staff access only. Ask an administrator for an account.
        </p>
      </div>
    </main>
  );
}
