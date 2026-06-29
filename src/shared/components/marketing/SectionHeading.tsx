export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">{title}</h2>
      {children ? <p className="mt-4 text-base leading-7 text-white/62 sm:text-lg">{children}</p> : null}
    </div>
  );
}
