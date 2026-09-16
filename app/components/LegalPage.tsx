import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { SITE, LEGAL_LAST_UPDATED } from "../lib/site";

interface LegalPageProps {
  title: string;
  intro: string;
  children: React.ReactNode;
}

/** Shared shell for the Privacy, Terms, and Accessibility pages. */
export default function LegalPage({ title, intro, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#f9f8f5] text-[#1c1b1a]">
      {/* Masthead */}
      <header className="bg-[#141312] text-[#e6d7c3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#cfc7ba] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {SITE.shortName}</span>
          </Link>

          <h1 className="font-serif text-3xl sm:text-4xl font-light mt-6">{title}</h1>
          <p className="text-xs text-[#a59d92] mt-3 tracking-wide">
            Last updated {LEGAL_LAST_UPDATED}
          </p>
        </div>
      </header>

      {/* Body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <p className="text-[15px] leading-relaxed text-[#4a4843] font-light">{intro}</p>

        <div className="space-y-8">{children}</div>

        {/* Contact fallback */}
        <section className="rounded-2xl border border-[#e5e0d8] bg-white p-6 space-y-3">
          <h2 className="font-serif text-lg font-medium">Questions about this page?</h2>
          <p className="text-sm text-[#5a5854] font-light leading-relaxed">
            Write to us or call the front desk and we will respond as quickly as we can.
          </p>
          <div className="space-y-2 text-sm">
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-2 text-[#a88956] hover:text-[#8f7343] transition-colors"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>{SITE.email}</span>
            </a>
            <a
              href="tel:+919070090713"
              className="flex items-center gap-2 text-[#a88956] hover:text-[#8f7343] transition-colors"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>+91 90700 90713</span>
            </a>
          </div>
          <p className="text-xs text-[#7a7771] font-light pt-1">
            {SITE.name}, {SITE.addressLocality}, {SITE.addressRegion}, {SITE.addressCountry}
          </p>
        </section>
      </article>
    </main>
  );
}

/** A titled block of body copy within a legal page. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-medium text-[#1c1b1a] border-b border-[#e5e0d8] pb-2">
        {heading}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#4a4843] font-light [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#a88956] [&_a:hover]:text-[#8f7343] [&_a]:underline [&_strong]:font-medium [&_strong]:text-[#1c1b1a]">
        {children}
      </div>
    </section>
  );
}
