import { cn } from "@/shared/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dc890] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-[#5f9965] text-white hover:bg-[#6bad72]",
        variant === "secondary" && "border border-white/15 bg-white/8 text-white hover:bg-white/12",
        variant === "ghost" && "text-white/78 hover:bg-white/8 hover:text-white",
        className,
      )}
      {...props}
    />
  );
}
