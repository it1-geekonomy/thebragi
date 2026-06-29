import { cn } from "@/shared/lib/cn";

type ToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
  pressed: boolean;
};

export function Toggle({ pressed, className, children, ...props }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dc890]",
        pressed ? "border-[#7dc890]/60 bg-[#7dc890]/16 text-white" : "border-white/12 bg-white/[0.04] text-white/58 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
