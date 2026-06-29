import { cn } from "@/shared/lib/cn";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "success" | "error";
};

export function Alert({ className, tone = "info", ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        tone === "info" && "border-white/12 bg-white/[0.045] text-white/72",
        tone === "success" && "border-[#7dc890]/30 bg-[#7dc890]/10 text-[#c7e8cf]",
        tone === "error" && "border-red-400/30 bg-red-400/10 text-red-100",
        className,
      )}
      {...props}
    />
  );
}
