"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";

const formFields = [
  { id: "name",     label: "YOUR NAME",  type: "text"  },
  { id: "email",    label: "WORK EMAIL", type: "email" },
  { id: "company",  label: "COMPANY",    type: "text"  },
  { id: "teamSize", label: "TEAM SIZE",  type: "text"  },
];

function RoundDot({ className = "" }: { className?: string }) {
  return (
    <>
      <span className="sr-only">.</span>
      <span
        aria-hidden="true"
        className={`inline-block h-[0.12em] w-[0.12em] rounded-full bg-current align-[0.03em] ${className}`}
      />
    </>
  );
}

function BragiLogo() {
  return (
    <div className="relative h-[23px] w-[96px] overflow-hidden sm:h-[29px] sm:w-[122px] lg:h-[32px] lg:w-[136px]">
      <Image
        src="/Bragi Logo-02.png"
        alt="Bragi"
        width={1024}
        height={576}
        priority
        className="absolute top-[-119px] left-[-183px] h-auto w-[462px] max-w-none sm:top-[-151px] sm:left-[-233px] sm:w-[587px] lg:top-[-168px] lg:left-[-260px] lg:w-[654px]"
      />
    </div>
  );
}

export default function BragiWaitlist() {
  const [values, setValues] = useState({
    name: "", email: "", company: "", teamSize: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (id: string, val: string) =>
    setValues((p) => ({ ...p, [id]: val }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="relative min-h-screen bg-black text-white">

      {/* ── Background image — covers full page ── */}
      <Image
        src="/Bragi Waitlist background-02.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center"
      />

      {/* ── Left-side black fade ── */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000_0%,#000_26%,rgba(0,0,0,0.90)_46%,rgba(0,0,0,0.20)_72%,rgba(0,0,0,0.04)_100%)]" />
      {/* ── Top-to-bottom darkening ── */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.50)_55%,rgba(0,0,0,0.68)_100%)]" />

      {/* ── Page content ── */}
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* ══ HEADER ══ */}
        <header className="px-5 pt-5 sm:px-9 sm:pt-7 lg:px-14 lg:pt-7">
          <BragiLogo />
        </header>

        {/* ══ HERO ══ */}
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-20 lg:py-40">

          {/* Eyebrow */}
          <p className="mb-4 text-[10px] font-normal tracking-[0.58em] text-[#5F9965]/85 sm:mb-5 sm:text-[22px]">
            EARLY ACCESS
          </p>

          {/* Headline */}
          <h1 className="max-w-5xl text-[clamp(2rem,5.2vw,4.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">
            <span className="block whitespace-nowrap">
              Your pipeline
              <RoundDot className="ml-[0.035em] mr-[0.18em]" />
              Your projects
              <RoundDot className="ml-[0.035em]" />
            </span>
            <span className="block whitespace-nowrap text-[#5F9965]">
              One place
              <RoundDot className="ml-[0.035em]" />
            </span>
          </h1>

          {/* Sub-copy */}
          <p className="mx-auto mt-6 max-w-[800px] text-sm leading-[1.82] text-white/58 sm:mt-7 sm:text-[22px]">
            Built for founders who are done running their business from{" "}
            <strong className="font-normal text-white/85">
              5 different tools and a prayer.
            </strong>{" "}
            Bragi connects your sales and delivery, end to end.
          </p>

          {/* ── Form card ── */}
          <div className="mx-auto mt-10 w-full max-w-[660px] rounded-[28px] border-4 border-[#1f2b21] bg-black/58 px-11 py-10 backdrop-blur-sm sm:mt-12 sm:px-12 sm:py-11">
            {submitted ? (
              <div className="py-10 text-center">
                <p className="text-xl font-bold text-[#5F9965]">You&apos;re on the list!</p>
                <p className="mt-2 text-sm text-white/50">
                  We&apos;ll reach out when early access opens.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>

                {/* 2 × 2 grid */}
                <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:gap-x-7 sm:gap-y-7">
                  {formFields.map(({ id, label, type }) => (
                    <div key={id} className="flex flex-col gap-3">
                      <label
                        htmlFor={id}
                        className="text-center text-[15px] font-semibold tracking-[0.02em] text-white/58"
                      >
                        {label}
                      </label>
                      <input
                        id={id}
                        type={type}
                        value={values[id as keyof typeof values]}
                        onChange={(e) => set(id, e.target.value)}
                        className="h-[56px] w-full rounded-[14px] border border-[#253327] bg-black/35 px-4 text-base text-white outline-none transition-colors duration-150 focus:border-[#4eb87b]/45 focus:bg-white/5"
                        autoComplete="off"
                      />
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <button
                  type="submit"
                  className="mt-8 h-[60px] w-full rounded-[14px] bg-[#2c5d47] text-[21px] font-semibold tracking-[0.01em] text-white transition-colors hover:bg-[#366f55] active:scale-[0.985]"
                >
                  Join the waitlist →
                </button>

                {/* Disclaimer */}
                <p className="mt-6 text-center text-[15px] font-medium text-white/32">
                  No spam. No pitch decks. Just early access when we launch.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* ══ METRICS STRIP ══ */}
        <div className="px-4 pb-12 pt-4 sm:px-9 lg:px-14">
          <div className="mx-auto flex max-w-[1080px] items-center justify-center">

            {/* Lead → Deal */}
            <div className="flex min-w-[230px] flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[34px] font-semibold leading-none text-white">Lead</span>
                <span className="relative flex h-px w-[72px] items-center bg-[#7dc890]/80">
                  <span className="absolute right-0 top-1/2 h-[8px] w-[8px] -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-[#7dc890]/80" />
                </span>
                <span className="text-[34px] font-semibold leading-none text-white">Deal</span>
              </div>
              <span className="text-[11px] tracking-[0.02em] text-white/24">Sales workspace</span>
            </div>

            {/* Divider */}
            <span className="mx-10 h-[86px] w-px bg-white/20" />

            {/* Project → Completed */}
            <div className="flex min-w-[360px] flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[34px] font-semibold leading-none text-white">Project</span>
                <span className="relative flex h-px w-[72px] items-center bg-[#7dc890]/80">
                  <span className="absolute right-0 top-1/2 h-[8px] w-[8px] -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-[#7dc890]/80" />
                </span>
                <span className="text-[34px] font-semibold leading-none text-white">Completed</span>
              </div>
              <span className="text-[11px] tracking-[0.02em] text-white/24">Delivery workspace</span>
            </div>

            {/* Divider */}
            <span className="mx-10 h-[86px] w-px bg-white/20" />

            {/* 1 tool */}
            <div className="flex min-w-[130px] flex-col items-center gap-2">
              <div className="flex items-end gap-2">
                <span className="text-[50px] font-semibold leading-[0.78] text-[#7dc890]">1</span>
                <span className="text-[34px] font-semibold leading-none text-white">tool</span>
              </div>
              <span className="text-[11px] tracking-[0.02em] text-white/24">Not &quot;X&quot; No&apos;s</span>
            </div>

          </div>
        </div>

        {/* ══ FOOTER BAR ══ */}
        <footer className="border-t border-[#2a6634] bg-black px-5 sm:px-9 lg:px-14">
          <div className="flex h-[72px] items-center justify-between sm:h-[100px]">
            <span className="text-[11px] font-medium text-white/28 sm:text-[13px] lg:text-[22px]">
              © 2026 Bragi | Built by Geekonomy
            </span>
            <a
              href="mailto:hello@thebragi.com"
              className="text-[11px] text-[#c7e8cf]/80 sm:text-[13px] lg:text-[15px]"
            >
              hello@thebragi.com
            </a>
          </div>
        </footer>

      </div>
    </main>
  );
}