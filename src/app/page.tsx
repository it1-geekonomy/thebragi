"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";

const formFields = [
  { id: "name",     label: "YOUR NAME",  type: "text"  },
  { id: "email",    label: "WORK EMAIL", type: "email" },
  { id: "company",  label: "COMPANY",    type: "text"  },
  { id: "teamSize", label: "TEAM SIZE",  type: "text"  },
];

function MetricArrow() {
  return (
    <svg
      viewBox="0 0 76 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-12 shrink-0 sm:w-14 lg:w-[72px]"
      aria-hidden="true"
    >
      <path
        d="M1 6H70M64 1.5L70 6L64 10.5"
        stroke="#7dc890"
        strokeOpacity="0.8"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (id: string, val: string) =>
    setValues((p) => ({ ...p, [id]: val }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Unable to join the waitlist.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to join the waitlist. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* ── Background image — covers full page ── */}
      <Image
        src="/Bragi Waitlist background-02.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-[62%_center] lg:object-right"
      />

      {/* ── Left-side black fade ── */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000_0%,#000_30%,rgba(0,0,0,0.92)_49%,rgba(0,0,0,0.34)_68%,rgba(0,0,0,0.02)_100%)] lg:bg-[linear-gradient(90deg,#000_0%,#000_38%,rgba(0,0,0,0.92)_57%,rgba(0,0,0,0.28)_76%,rgba(0,0,0,0)_100%)]" />
      {/* ── Top-to-bottom darkening ── */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.50)_55%,rgba(0,0,0,0.68)_100%)]" />

      {/* ── Page content ── */}
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* ══ HEADER ══ */}
        <header className="px-5 pt-5 sm:px-9 sm:pt-7 lg:px-14 lg:pt-7">
          <BragiLogo />
        </header>

        {/* ══ HERO ══ */}
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:py-14 md:py-16 lg:py-40">

          {/* Eyebrow */}
          <p className="mb-4 text-[10px] font-normal tracking-[0.48em] text-[#5F9965]/85 sm:mb-5 sm:text-sm md:text-base lg:text-[22px]">
            EARLY ACCESS
          </p>

          {/* Headline */}
          <h1 className="max-w-full text-[clamp(1.45rem,6.2vw,4.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white sm:max-w-5xl">
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
          <p className="mx-auto mt-5 max-w-[800px] text-xs leading-[1.75] text-white/58 sm:mt-6 sm:text-sm md:text-base lg:mt-7 lg:text-[22px]">
            Built for founders who are done running their business from{" "}
            <strong className="font-normal text-white/85">
              5 different tools and a prayer.
            </strong>{" "}
            Bragi connects your sales and delivery, end to end.
          </p>

          {/* ── Form card ── */}
          <div className="mx-auto mt-7 w-full max-w-[360px] rounded-[18px] border-2 border-[#1f2b21] bg-black/58 px-4 py-5 backdrop-blur-sm sm:mt-10 sm:max-w-[660px] sm:rounded-[28px] sm:border-4 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:mt-12 lg:px-12 lg:py-11">
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
                <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-5 sm:gap-y-6 md:gap-x-7 md:gap-y-7">
                  {formFields.map(({ id, label, type }) => (
                    <div key={id} className="flex flex-col gap-1.5 sm:gap-3">
                      <label
                        htmlFor={id}
                        className="text-center text-[8px] font-semibold tracking-[0.08em] text-white/58 sm:text-xs md:text-[15px] md:tracking-[0.02em]"
                      >
                        {label}
                      </label>
                      <input
                        id={id}
                        type={type}
                        value={values[id as keyof typeof values]}
                        onChange={(e) => set(id, e.target.value)}
                        className="h-9 w-full rounded-[8px] border border-[#253327] bg-black/35 px-3 text-sm text-white outline-none transition-colors duration-150 focus:border-[#4eb87b]/45 focus:bg-white/5 sm:h-12 sm:rounded-[10px] sm:px-4 md:h-[56px] md:rounded-[14px] md:text-base"
                        autoComplete="off"
                        required={id === "name" || id === "email"}
                      />
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 h-10 w-full rounded-[8px] bg-[#2c5d47] text-xs font-semibold tracking-[0.01em] text-white transition-colors hover:bg-[#366f55] active:scale-[0.985] sm:h-14 sm:rounded-[10px] sm:text-base md:mt-8 md:h-[60px] md:rounded-[14px] md:text-[21px]"
                >
                  {submitting ? "Joining..." : "Join the waitlist →"}
                </button>

                {/* Disclaimer */}
                {error ? (
                  <p className="mt-3 text-center text-[8px] font-medium text-red-300/80 sm:text-xs md:mt-6 md:text-[15px]">
                    {error}
                  </p>
                ) : (
                  <p className="mt-3 text-center text-[8px] font-medium text-white/32 sm:text-xs md:mt-6 md:text-[15px]">
                    No spam. No pitch decks. Just early access when we launch.
                  </p>
                )}
              </form>
            )}
          </div>
        </section>

        {/* ══ METRICS STRIP ══ */}
        <div className="px-4 pb-8 pt-2 sm:px-9 md:pb-10 lg:px-14 lg:pb-12 lg:pt-4">
          <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-center gap-5 md:flex-row md:gap-0">

            {/* Lead → Deal */}
            <div className="flex min-w-[190px] flex-col items-center gap-1.5 lg:min-w-[230px] lg:gap-2">
              <div className="flex items-center gap-2.5 lg:gap-3">
                <span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Lead</span>
                <MetricArrow />
                <span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Deal</span>
              </div>
              <span className="text-[10px] tracking-[0.02em] text-white/24 lg:text-[11px]">Sales workspace</span>
            </div>

            {/* Divider */}
            <span className="hidden h-[58px] w-px bg-white/20 md:block md:mx-5 lg:mx-10 lg:h-[86px]" />

            {/* Project → Completed */}
            <div className="flex min-w-[280px] flex-col items-center gap-1.5 lg:min-w-[360px] lg:gap-2">
              <div className="flex items-center gap-2.5 lg:gap-3">
                <span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Project</span>
                <MetricArrow />
                <span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Completed</span>
              </div>
              <span className="text-[10px] tracking-[0.02em] text-white/24 lg:text-[11px]">Delivery workspace</span>
            </div>

            {/* Divider */}
            <span className="hidden h-[58px] w-px bg-white/20 md:block md:mx-5 lg:mx-10 lg:h-[86px]" />

            {/* 1 tool */}
            <div className="flex min-w-[110px] flex-col items-center gap-1.5 lg:min-w-[130px] lg:gap-2">
              <div className="flex items-end gap-1.5 lg:gap-2">
                <span className="text-[36px] font-semibold leading-[0.78] text-[#7dc890] sm:text-[42px] lg:text-[50px]">1</span>
                <span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">tool</span>
              </div>
              <span className="text-[10px] tracking-[0.02em] text-white/24 lg:text-[11px]">Not &quot;X&quot; No&apos;s</span>
            </div>

          </div>
        </div>

        {/* ══ FOOTER BAR ══ */}
        <footer className="border-t border-[#2a6634] bg-black px-5 sm:px-9 lg:px-14">
          <div className="flex min-h-[72px] flex-col items-center justify-center gap-2 py-4 text-center sm:h-[84px] sm:flex-row sm:justify-between sm:gap-0 sm:py-0 lg:h-[100px]">
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