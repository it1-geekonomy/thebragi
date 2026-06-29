import { MetricArrow } from "@/shared/components/branding/MetricArrow";

export function MetricsStrip() {
  return (
    <section className="border-y border-[#2a6634] bg-black px-4 py-10 sm:px-9 lg:px-14">
      <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-center gap-7 md:flex-row md:gap-0">
        <div className="flex min-w-[190px] flex-col items-center gap-1.5 lg:min-w-[230px] lg:gap-2">
          <div className="flex items-center gap-2.5 lg:gap-3"><span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Lead</span><MetricArrow /><span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Deal</span></div>
          <span className="text-[10px] tracking-[0.02em] text-white/24 lg:text-[11px]">Sales workspace</span>
        </div>
        <span className="hidden h-[58px] w-px bg-white/20 md:block md:mx-5 lg:mx-10 lg:h-[86px]" />
        <div className="flex min-w-[280px] flex-col items-center gap-1.5 lg:min-w-[360px] lg:gap-2">
          <div className="flex items-center gap-2.5 lg:gap-3"><span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Project</span><MetricArrow /><span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">Completed</span></div>
          <span className="text-[10px] tracking-[0.02em] text-white/24 lg:text-[11px]">Delivery workspace</span>
        </div>
        <span className="hidden h-[58px] w-px bg-white/20 md:block md:mx-5 lg:mx-10 lg:h-[86px]" />
        <div className="flex min-w-[110px] flex-col items-center gap-1.5 lg:min-w-[130px] lg:gap-2">
          <div className="flex items-end gap-1.5 lg:gap-2"><span className="text-[36px] font-semibold leading-[0.78] text-[#7dc890] sm:text-[42px] lg:text-[50px]">1</span><span className="text-[24px] font-semibold leading-none text-white sm:text-[28px] lg:text-[34px]">tool</span></div>
          <span className="text-[10px] tracking-[0.02em] text-white/24 lg:text-[11px]">Not five tabs</span>
        </div>
      </div>
    </section>
  );
}
