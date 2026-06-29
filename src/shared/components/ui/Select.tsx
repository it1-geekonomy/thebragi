import { cn } from "@/shared/lib/cn";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("h-12 rounded-md border border-white/12 bg-black/70 px-4 text-white outline-none focus:border-[#7dc890]", className)}
      {...props}
    />
  );
}
