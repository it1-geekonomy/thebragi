import Image from "next/image";
import { CTAButton } from "@/shared/components/marketing/CTAButton";
import { RoundDot } from "@/shared/components/branding/RoundDot";
import { ROUTES } from "@/config/routes";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-black text-white">
      <Image src="/bragi-hero.webp" alt="" fill priority sizes="100vw" className="pointer-events-none object-cover object-[62%_center] lg:object-right" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000_0%,#000_30%,rgba(0,0,0,0.92)_49%,rgba(0,0,0,0.34)_68%,rgba(0,0,0,0.02)_100%)] lg:bg-[linear-gradient(90deg,#000_0%,#000_38%,rgba(0,0,0,0.92)_57%,rgba(0,0,0,0.28)_76%,rgba(0,0,0,0)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.45)_56%,#000_100%)]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-5 py-20 text-center sm:px-8 lg:px-10">
        <p className="mb-4 text-[10px] font-normal tracking-[0.28em] text-[#5F9965]/85 sm:mb-5 sm:text-sm sm:tracking-[0.4em] md:text-base md:tracking-[0.48em] lg:text-[22px]">BRAGI WORKSPACE</p>
        <h1 className="mx-auto w-full min-w-0 max-w-6xl px-1 text-balance font-medium leading-[1.08] tracking-[-0.02em] text-white text-[clamp(1.75rem,8vw,2.4rem)] sm:text-[clamp(2.15rem,5.4vw,3.75rem)] md:text-[clamp(2.5rem,4.2vw,4.65rem)] lg:text-[clamp(2.85rem,3.4vw,5rem)] xl:text-[clamp(3rem,3vw,5.25rem)]">
          <span className="flex flex-col items-center gap-y-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-center sm:gap-x-[0.15em] sm:gap-y-1">
            <span className="inline-flex items-baseline sm:whitespace-nowrap">
              Your pipeline
              <RoundDot className="ml-[0.035em] mr-[0.12em]" />
            </span>
            <span className="inline-flex items-baseline sm:whitespace-nowrap">
              Your projects
              <RoundDot className="ml-[0.035em]" />
            </span>
          </span>
          <span className="mt-1 block text-[#5F9965]">
            One place
            <RoundDot className="ml-[0.035em]" />
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-[820px] text-sm leading-[1.75] text-white/62 sm:text-base lg:text-[22px]">Built for founders who are done running their business from <strong className="font-normal text-white/88">five different tools and a prayer.</strong> Bragi connects sales and delivery end to end.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CTAButton href={ROUTES.pricing}>Start free trial</CTAButton>
          <CTAButton href={ROUTES.pricing} variant="secondary">See plans & buy</CTAButton>
        </div>
      </div>
    </section>
  );
}
