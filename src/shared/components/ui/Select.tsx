import { cn } from "@/shared/lib/cn";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 appearance-none rounded-md border border-white/15 bg-[#111a13] px-4 text-[16px] text-white outline-none [color-scheme:dark] focus:border-[#7dc890] focus:ring-2 focus:ring-[#7dc890]/25",
        className,
      )}
      {...props}
    />
  );
}
