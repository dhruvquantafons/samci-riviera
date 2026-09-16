import { Info } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { requireAdmin } from "../../../lib/auth";
import type { Staff } from "../../../lib/types";
import { updateStaffMember } from "../../actions";
import {
  PageHeader,
  Card,
  EmptyState,
  fmtDateTime,
  inputClass,
  secondaryButtonClass,
} from "../../components/ui";

export default async function StaffPage() {
  const me = await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("staff")
    .select("*")
    .order("created_at", { ascending: true });

  const members = (data ?? []) as Staff[];

  return (
    <>
      <PageHeader
        title="Staff"
        description="Who can sign in, and what they are allowed to change."
      />

      <div className="flex items-start gap-2.5 text-xs bg-[#faf9f6] border border-[#e5e0d8] text-[#5a5854] rounded-lg px-4 py-3 mb-6">
        <Info className="w-4 h-4 shrink-0 mt-px text-[#a88956]" />
        <p className="font-light leading-relaxed">
          New accounts are created in the Supabase dashboard under{" "}
          <strong className="font-medium">Authentication → Users</strong>. Anyone added there
          appears here as <strong className="font-medium">front desk</strong> and can be
          promoted below. Front desk staff manage bookings, guests and rooms; administrators
          additionally control rates and this page.
        </p>
      </div>

      <Card>
        {members.length === 0 ? (
          <EmptyState message="No staff accounts yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-[#9a9490] border-b border-[#f0ece5]">
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-5 py-3 font-semibold">Added</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Access</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece5]">
                {members.map((member) => {
                  const isMe = member.id === me.id;
                  return (
                    <tr key={member.id} className="hover:bg-[#faf9f6] transition-colors">
                      <td className="px-5 py-3">
                        <span className="block font-medium text-[#1c1b1a]">
                          {member.full_name || "—"}
                          {isMe && (
                            <span className="ml-2 text-[10px] text-[#a88956] font-normal">
                              (you)
                            </span>
                          )}
                        </span>
                        <span className="block text-[11px] text-[#9a9490]">{member.email}</span>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-[#9a9490] whitespace-nowrap">
                        {fmtDateTime(member.created_at)}
                      </td>

                      {isMe ? (
                        <>
                          <td className="px-5 py-3 text-[#5a5854] capitalize">
                            {member.role.replace("_", " ")}
                          </td>
                          <td className="px-5 py-3 text-[#5a5854]">Active</td>
                          <td className="px-5 py-3 text-[11px] text-[#9a9490]">
                            Cannot edit own access
                          </td>
                        </>
                      ) : (
                        <td colSpan={3} className="px-5 py-3">
                          <form action={updateStaffMember} className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="id" value={member.id} />
                            <select
                              name="role"
                              defaultValue={member.role}
                              className={`${inputClass} !py-1.5 !text-xs max-w-[150px]`}
                            >
                              <option value="front_desk">Front desk</option>
                              <option value="admin">Administrator</option>
                            </select>
                            <select
                              name="is_active"
                              defaultValue={String(member.is_active)}
                              className={`${inputClass} !py-1.5 !text-xs max-w-[130px]`}
                            >
                              <option value="true">Active</option>
                              <option value="false">Suspended</option>
                            </select>
                            <button type="submit" className={secondaryButtonClass}>
                              Save
                            </button>
                          </form>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
