import Link from "next/link";
import { cn } from "@/shared/lib/cn";

export function CTAButton({ href, children, variant = "primary", className }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary"; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dc890]",
        variant === "primary" ? "bg-[#5f9965] text-white hover:bg-[#6bad72]" : "border border-white/15 bg-white/8 text-white hover:bg-white/12",
        className,
      )}
    >
      {children}
    </Link>
  );
}
