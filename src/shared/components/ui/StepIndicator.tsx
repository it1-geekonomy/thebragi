import { cn } from "@/shared/lib/cn";

export function StepIndicator({ steps, active }: { steps: string[]; active: number }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((step, index) => (
        <li
          key={step}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold",
            index === active ? "border-[#7dc890] bg-[#7dc890]/14 text-white" : "border-white/12 text-white/48",
          )}
        >
          {index + 1}. {step}
        </li>
      ))}
    </ol>
  );
}
