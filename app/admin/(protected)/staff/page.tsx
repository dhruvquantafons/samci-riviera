import { Info } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { requireAdmin } from "../../../lib/auth";
import type { Staff } from "../../../lib/types";
import { STAFF_ROLES, STAFF_ROLE_LABELS, STAFF_ROLE_DESCRIPTIONS } from "../../../lib/types";
import { PageHeader, Card, EmptyState, fmtDateTime } from "../../components/ui";
import StaffMemberForm from "./StaffMemberForm";
import AddStaffForm from "./AddStaffForm";
import StaffAccountActions from "./StaffAccountActions";

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
        <div className="font-light leading-relaxed space-y-1.5">
          <p>
            A <strong className="font-medium">role</strong> sets what someone can reach in
            this panel. Their actual job — Waiter, Head Chef, Night Manager — goes in{" "}
            <strong className="font-medium">job title</strong>, which is free text.
          </p>
          <ul className="space-y-0.5 pl-4 list-disc">
            {STAFF_ROLES.map((role) => (
              <li key={role}>
                <strong className="font-medium">{STAFF_ROLE_LABELS[role]}</strong> —{" "}
                {STAFF_ROLE_DESCRIPTIONS[role]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Card className="p-5 mb-6">
        <AddStaffForm />
      </Card>

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

              <div className="pt-4 border-t border-[#f0ece5] space-y-3">
                {member.id !== me.id && <StaffAccountActions member={member} />}
                <p className="text-[11px] text-[#c9c4bc]">
                  Account created {fmtDateTime(member.created_at)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
