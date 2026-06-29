"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { productNav } from "@/config/nav";
import { ROUTES } from "@/config/routes";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { Badge } from "@/shared/components/ui/Badge";
import { cn } from "@/shared/lib/cn";

export function ProductShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#070907] text-white lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="border-b border-white/10 bg-black px-5 py-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-6">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link href={ROUTES.home} aria-label="Bragi home"><BragiLogo /></Link>
          <Badge className="lg:mt-8">App preview</Badge>
        </div>
        <nav className="mt-6 grid gap-2 text-sm text-white/62 lg:mt-8">
          {productNav.map((item) => {
            const active = pathname === item.href || (item.href !== ROUTES.dashboard && pathname.startsWith(item.href));
            return <Link key={item.href} className={cn("rounded-md px-3 py-3 hover:bg-white/8 hover:text-white", active && "bg-[#7dc890]/12 text-white")} href={item.href}>{item.label}</Link>;
          })}
        </nav>
        <div className="mt-8 hidden rounded-lg border border-white/10 bg-white/[0.035] p-4 text-xs leading-5 text-white/44 lg:block">
          Plan gates are shown as frontend state for now. Backend session and module access can plug into this shell later.
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between border-b border-white/10 bg-black/40 px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7dc890]">Bragi App</p>
            <p className="mt-1 text-sm text-white/44">Sales and delivery workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <Link className="text-sm font-semibold text-white/62 hover:text-white" href={ROUTES.account.billing}>Billing</Link>
            <Link className="rounded-md bg-[#5f9965] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6bad72]" href={ROUTES.account.profile}>Account</Link>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
