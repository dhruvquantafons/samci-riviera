import type { Metadata } from "next";
import { connection } from "next/server";
import { requireStaff } from "../../lib/auth";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import Sidebar from "../components/Sidebar";
import SetupNotice from "../components/SetupNotice";

export const metadata: Metadata = {
  title: "Reservations Desk",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // An authenticated shell must never be prerendered and cached. Without this,
  // a build with no Supabase credentials would bake the setup notice in.
  await connection();

  if (!hasSupabaseConfig()) return <SetupNotice />;

  // proxy.ts already blocks signed-out traffic; this is the authoritative check.
  const staff = await requireStaff();

  return (
    <div className="min-h-screen bg-[#f6f5f2]">
      <Sidebar staff={staff} />
      <div className="lg:pl-64">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
