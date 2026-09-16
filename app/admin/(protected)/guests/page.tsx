import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { requireStaff } from "../../../lib/auth";
import type { Guest } from "../../../lib/types";
import {
  PageHeader,
  Card,
  EmptyState,
  fmtDate,
  inputClass,
  buttonClass,
} from "../../components/ui";

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaff();
  const { q = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    const term = `%${q}%`;
    query = query.or(
      `full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`,
    );
  }

  const { data } = await query;
  const guests = (data ?? []) as Guest[];

  return (
    <>
      <PageHeader
        title="Guests"
        description="Everyone who has stayed with us or asked to."
      />

      <form className="flex gap-2 mb-5" action="/admin/guests">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9a9490] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, email or phone"
            className={`${inputClass} pl-9`}
          />
        </div>
        <button type="submit" className={buttonClass}>
          Search
        </button>
      </form>

      <Card>
        {guests.length === 0 ? (
          <EmptyState message="No guest records yet." />
        ) : (
          <ul className="divide-y divide-[#f0ece5]">
            {guests.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/admin/guests/${g.id}`}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-[#faf9f6] transition-colors"
                >
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-sm font-medium text-[#1c1b1a]">{g.full_name}</p>
                    <p className="text-[11px] text-[#9a9490]">
                      {[g.phone, g.email].filter(Boolean).join(" · ") || "No contact details"}
                    </p>
                  </div>

                  {g.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {g.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] rounded-full bg-[#f2ece2] text-[#8f7343] border border-[#e5d9c6]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-[#9a9490] whitespace-nowrap">
                    Added {fmtDate(g.created_at.split("T")[0])}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
