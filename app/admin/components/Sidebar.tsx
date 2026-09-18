"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  IndianRupee,
  UserCog,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { Staff } from "../../lib/types";
import { canManageStaff, canManageRates, canManageBookings, STAFF_ROLE_LABELS } from "../../lib/types";
import { signOut } from "../actions";

import type { StaffRole } from "../../lib/types";

const NAV: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  allowed: (role: StaffRole) => boolean;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, allowed: () => true },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, allowed: canManageBookings },
  { href: "/admin/rooms", label: "Rooms", icon: BedDouble, allowed: () => true },
  { href: "/admin/rates", label: "Rates", icon: IndianRupee, allowed: canManageRates },
  { href: "/admin/staff", label: "Staff", icon: UserCog, allowed: canManageStaff },
];

export default function Sidebar({ staff }: { staff: Staff }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = NAV.filter((item) => item.allowed(staff.role));

  const nav = (
    <nav className="space-y-1">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active
                ? "bg-[#a88956] text-white font-medium"
                : "text-[#cfc7ba] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 pt-4 space-y-3">
      <div className="px-3">
        <p className="text-sm text-white font-medium truncate">
          {staff.full_name || staff.email}
        </p>
        <p className="text-[11px] text-[#9a9490]">
          {STAFF_ROLE_LABELS[staff.role]}
          {staff.job_title ? ` · ${staff.job_title}` : ""}
        </p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#cfc7ba] hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin" className="block px-3">
      <p className="font-serif text-lg text-[#e6d7c3] font-medium tracking-[0.15em] uppercase">
        Samci Riviera
      </p>
      <p className="text-[9px] tracking-[0.25em] text-[#9a9490] uppercase">
        Reservations Desk
      </p>
    </Link>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-[#141312] px-4 py-3">
        {brand}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-[#cfc7ba] p-1.5 cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-64 bg-[#141312] p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                {brand}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="text-[#cfc7ba] p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {nav}
            </div>
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop rail */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-[#141312] p-4 flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {brand}
          {nav}
        </div>
        {footer}
      </aside>
    </>
  );
}
