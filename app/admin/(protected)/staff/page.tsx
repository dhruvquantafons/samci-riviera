import { Info } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { requireAdmin } from "../../../lib/auth";
import type { Staff } from "../../../lib/types";
import { PageHeader, Card, EmptyState, fmtDateTime } from "../../components/ui";
import StaffMemberForm from "./StaffMemberForm";

export default async function StaffPage() {
  const me = await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("staff")
    .select("*")
    .order("created_at", { ascending: true });

  const members = (data ?? []) as Staff[];
  const incomplete = members.filter((m) => !m.full_name.trim()).length;

  return (
    <>
      <PageHeader
        title="Staff"
        description="Details, roles and access for everyone who can sign in."
      />

      <div className="flex items-start gap-2.5 text-xs bg-[#faf9f6] border border-[#e5e0d8] text-[#5a5854] rounded-lg px-4 py-3 mb-6">
        <Info className="w-4 h-4 shrink-0 mt-px text-[#a88956]" />
        <div className="font-light leading-relaxed space-y-1">
          <p>
            <strong className="font-medium">Adding someone:</strong> create their login in
            the Supabase dashboard under{" "}
            <strong className="font-medium">Authentication → Users</strong> (tick
            &ldquo;Auto Confirm User&rdquo;). They appear here immediately as{" "}
            <strong className="font-medium">front desk</strong> with no name — fill in their
            details below.
          </p>
          <p>
            Front desk staff manage bookings and rooms. Administrators additionally control
            rates, room photos and this page.
          </p>
        </div>
      </div>

      {incomplete > 0 && (
        <p className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-4 py-2.5 mb-6">
          {incomplete} staff member{incomplete === 1 ? " has" : "s have"} no name recorded yet.
        </p>
      )}

      {members.length === 0 ? (
        <Card>
          <EmptyState message="No staff accounts yet." />
        </Card>
      ) : (
        <div className="space-y-5">
          {members.map((member) => (
            <Card key={member.id} className="p-5 space-y-4">
              <StaffMemberForm member={member} isSelf={member.id === me.id} />
              <p className="text-[11px] text-[#c9c4bc] pt-3 border-t border-[#f0ece5]">
                Account created {fmtDateTime(member.created_at)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
