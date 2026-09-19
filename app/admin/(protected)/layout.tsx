import type { Metadata } from "next";
import { connection } from "next/server";
import { requireSession, accessForClient } from "../../lib/auth";
import { getSettings } from "../../lib/settings";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import Sidebar from "../components/Sidebar";
import SetupNotice from "../components/SetupNotice";
import IdleTimer from "../components/IdleTimer";

export const metadata: Metadata = {
  title: "Property Management",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // An authenticated shell must never be prerendered and cached.
  await connection();

  if (!hasSupabaseConfig()) return <SetupNotice />;

  // proxy.ts already blocks signed-out traffic; this is the authoritative
  // check, and it also enforces 2FA and password expiry.
  const session = await requireSession();
  const settings = await getSettings();

  return (
    <div className="admin-theme min-h-screen bg-slate-50 print:bg-white">
      <Sidebar staff={session.staff} roleName={session.role.name} access={accessForClient(session)} />
      <IdleTimer minutes={settings.session_timeout_minutes} />
      <div className="lg:pl-60 print:pl-0">
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 print:p-0 print:max-w-none">{children}</main>
      </div>
    </div>
  );
}
