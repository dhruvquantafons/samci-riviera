import Link from "next/link";
import type { BookingStatus } from "../../lib/types";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_STYLES } from "../../lib/types";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-serif text-2xl text-[#1c1b1a] font-medium">{title}</h1>
        {description && (
          <p className="text-sm text-[#7a7771] font-light mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-[#e5e0d8] rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatusPill({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${BOOKING_STATUS_STYLES[status]}`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

export function StatCard({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: number | string;
  href?: string;
  hint?: string;
}) {
  const body = (
    <div className="bg-white border border-[#e5e0d8] rounded-xl p-5 shadow-sm hover:border-[#d9c3a3] transition-colors h-full">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a9490] font-semibold">
        {label}
      </p>
      <p className="font-serif text-3xl text-[#1c1b1a] font-medium mt-2">{value}</p>
      {hint && <p className="text-[11px] text-[#9a9490] font-light mt-1">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.18em] text-[#7a7771] font-semibold mb-1.5">
        {label}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-[#9a9490] mt-1">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full px-3 py-2 text-sm bg-white border border-[#e5e0d8] rounded-lg text-[#1c1b1a] focus:outline-none focus:border-[#a88956] focus:ring-1 focus:ring-[#a88956] transition-colors";

export const buttonClass =
  "px-4 py-2 text-xs uppercase tracking-[0.15em] font-semibold rounded-lg bg-[#a88956] text-white hover:bg-[#8f7343] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export const secondaryButtonClass =
  "px-4 py-2 text-xs uppercase tracking-[0.15em] font-semibold rounded-lg bg-white text-[#5a5854] border border-[#e5e0d8] hover:border-[#a88956] hover:text-[#a88956] transition-colors cursor-pointer";

export function Banner({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <p
      role="status"
      className={`text-xs px-3 py-2 rounded-lg border ${
        error
          ? "bg-rose-50 text-rose-800 border-rose-200"
          : "bg-emerald-50 text-emerald-800 border-emerald-200"
      }`}
    >
      {error ?? success}
    </p>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-14 text-sm text-[#9a9490] font-light">{message}</div>
  );
}

/** Formats a yyyy-mm-dd date without dragging in a timezone shift. */
export function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtMoney(amount: number | null) {
  if (amount === null) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function nightsBetween(checkIn: string, checkOut: string) {
  return Math.max(
    1,
    Math.round(
      (new Date(checkOut + "T00:00:00").getTime() -
        new Date(checkIn + "T00:00:00").getTime()) /
        86400000,
    ),
  );
}
