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
        <p className="mb-4 text-[10px] font-normal tracking-[0.48em] text-[#5F9965]/85 sm:mb-5 sm:text-sm md:text-base lg:text-[22px]">BRAGI WORKSPACE</p>
        <h1 className="mx-auto max-w-6xl text-[clamp(2.15rem,6.2vw,5.6rem)] font-medium leading-[1.02] text-white">
          <span className="block">Your pipeline<RoundDot className="ml-[0.035em] mr-[0.18em]" />Your projects<RoundDot className="ml-[0.035em]" /></span>
          <span className="block text-[#5F9965]">One place<RoundDot className="ml-[0.035em]" /></span>
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
