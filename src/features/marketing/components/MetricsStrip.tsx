import type { ReactNode } from "react";
import { MetricArrow } from "@/shared/components/branding/MetricArrow";

function MetricBlock({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-1.5 text-center sm:gap-2">
      {title}
      <span className="text-[10px] tracking-[0.02em] text-white/24 sm:text-[11px]">{subtitle}</span>
    </div>
  );
}

export function MetricsStrip() {
  return (
    <section className="border-y border-[#2a6634] bg-black px-4 py-10 sm:px-9 lg:px-14">
      <div className="mx-auto grid max-w-[1080px] gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
        <MetricBlock
          subtitle="Sales workspace"
          title={
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 lg:gap-3">
              <span className="text-[22px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Lead</span>
              <MetricArrow />
              <span className="text-[22px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Deal</span>
            </div>
          }
        />
        <MetricBlock
          subtitle="Delivery workspace"
          title={
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 lg:gap-3">
              <span className="text-[22px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Project</span>
              <MetricArrow />
              <span className="text-[22px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Completed</span>
            </div>
          }
        />
        <MetricBlock
          subtitle="Not five tabs"
          title={
            <div className="flex items-end justify-center gap-1.5 lg:gap-2">
              <span className="text-[32px] font-semibold leading-[0.78] text-[#7dc890] sm:text-[42px] lg:text-[50px]">1</span>
              <span className="text-[22px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">tool</span>
            </div>
          }
        />
      </div>
    </section>
  );
}
