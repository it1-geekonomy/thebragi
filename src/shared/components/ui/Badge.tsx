import { cn } from "@/shared/lib/cn";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#7dc890]/25 bg-[#7dc890]/10 px-3 py-1 text-xs font-semibold text-[#bce8c5]",
        className,
      )}
      {...props}
    />
  );
}
