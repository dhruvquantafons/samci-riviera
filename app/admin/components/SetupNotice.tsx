import { Database } from "lucide-react";

/** Shown in place of the admin panel until Supabase credentials exist. */
export default function SetupNotice() {
  return (
    <main className="min-h-screen bg-[#141312] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e5e0d8] p-7 shadow-2xl">
        <div className="w-11 h-11 rounded-full bg-[#f2ece2] text-[#a88956] flex items-center justify-center mb-4">
          <Database className="w-5 h-5" />
        </div>

        <h1 className="font-serif text-xl text-[#1c1b1a] font-medium mb-2">
          Reservations desk not configured
        </h1>
        <p className="text-sm text-[#5a5854] font-light leading-relaxed mb-5">
          The admin panel needs a Supabase project before it can run. The public
          website is unaffected and continues to serve the published tariff.
        </p>

        <ol className="text-sm text-[#5a5854] font-light space-y-2.5 list-decimal pl-5 mb-5">
          <li>
            Create a project at{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a88956] underline"
            >
              supabase.com/dashboard
            </a>
            .
          </li>
          <li>
            Run <code className="bg-[#f5f3ef] px-1.5 py-0.5 rounded text-[13px]">supabase/migrations/0001_init.sql</code>{" "}
            in the SQL editor.
          </li>
          <li>
            Set <code className="bg-[#f5f3ef] px-1.5 py-0.5 rounded text-[13px]">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code className="bg-[#f5f3ef] px-1.5 py-0.5 rounded text-[13px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
            <code className="bg-[#f5f3ef] px-1.5 py-0.5 rounded text-[13px]">SUPABASE_SERVICE_ROLE_KEY</code>.
          </li>
          <li>
            Add your first user under <strong className="font-medium">Authentication → Users</strong>. The
            first account becomes the administrator.
          </li>
        </ol>

        <p className="text-xs text-[#9a9490] font-light">
          Full instructions are in the project README.
        </p>
      </div>
    </main>
  );
}
