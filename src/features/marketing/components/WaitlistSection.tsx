"use client";

import { type FormEvent, useState } from "react";

const formFields = [
  { id: "name", label: "YOUR NAME", type: "text" },
  { id: "email", label: "Email", type: "email" },
  { id: "company", label: "COMPANY", type: "text" },
];

export function WaitlistSection() {
  const [values, setValues] = useState({ name: "", email: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (id: string, val: string) => setValues((previous) => ({ ...previous, [id]: val }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
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
      setError(err instanceof Error ? err.message : "Unable to join the waitlist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="border-y border-[#1f2b21] bg-black px-5 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Early access</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">Get Bragi before the handoff problem gets bigger.</h2>
          <p className="mt-4 text-base leading-7 text-white/58">Tell us who you are and we will reach out when early access opens for sales and delivery teams.</p>
        </div>
        <div className="rounded-[18px] border-2 border-[#1f2b21] bg-black/58 px-4 py-5 backdrop-blur-sm sm:rounded-[28px] sm:border-4 sm:px-8 sm:py-8 md:px-10 md:py-10">
          {submitted ? (
            <div className="py-10 text-center">
              <p className="text-xl font-bold text-[#5F9965]">You&apos;re on the list!</p>
              <p className="mt-2 text-sm text-white/50">We&apos;ll reach out when early access opens.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-5 sm:gap-y-6 md:gap-x-7 md:gap-y-7">
                {formFields.map(({ id, label, type }) => (
                  <div key={id} className="flex flex-col gap-1.5 sm:gap-3">
                    <label htmlFor={id} className="text-center text-[8px] font-semibold tracking-[0.08em] text-white/58 sm:text-xs md:text-[15px] md:tracking-[0.02em]">
                      {label}
                    </label>
                    <input
                      id={id}
                      type={type}
                      value={values[id as keyof typeof values]}
                      onChange={(event) => set(id, event.target.value)}
                      className="h-9 w-full rounded-[8px] border border-[#253327] bg-black/35 px-3 text-sm text-white outline-none transition-colors duration-150 focus:border-[#4eb87b]/45 focus:bg-white/5 sm:h-12 sm:rounded-[10px] sm:px-4 md:h-[56px] md:rounded-[14px] md:text-base"
                      autoComplete="off"
                      required={id === "name" || id === "email"}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={submitting} className="mt-5 h-10 w-full rounded-[8px] bg-[#2c5d47] text-xs font-semibold tracking-[0.01em] text-white transition-colors hover:bg-[#366f55] active:scale-[0.985] sm:h-14 sm:rounded-[10px] sm:text-base md:mt-8 md:h-[60px] md:rounded-[14px] md:text-[21px]">
                {submitting ? "Joining..." : "Join the waitlist ->"}
              </button>
              <p className={`mt-3 text-center text-[8px] font-medium sm:text-xs md:mt-6 md:text-[15px] ${error ? "text-red-300/80" : "text-white/32"}`}>
                {error || "No spam. No pitch decks. Just early access when we launch."}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
