import { cn } from "@/shared/lib/cn";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-md border border-white/12 bg-black/35 px-4 py-3 text-base text-white outline-none transition focus:border-[#7dc890]",
        className,
      )}
      {...props}
    />
  );
}
