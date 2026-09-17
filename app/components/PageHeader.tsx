import Image from "next/image";

/**
 * Banner at the top of an interior page. Sits under the fixed header, so it
 * carries its own top padding rather than relying on the section below.
 */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  image,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  image: string;
}) {
  return (
    <section className="relative pt-32 pb-14 sm:pt-40 sm:pb-20 overflow-hidden bg-[#0b131b]">
      <Image
        src={image}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        priority
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#0b131b]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#e6d7c3] font-semibold mb-3">
          {eyebrow}
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
          {title}
        </h1>
        {lead && (
          <p className="mt-4 max-w-xl mx-auto text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}
