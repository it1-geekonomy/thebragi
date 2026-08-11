"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { productNav } from "@/config/nav";
import { ROUTES } from "@/config/routes";
import { useAppSelector } from "@/store/hooks";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { Badge } from "@/shared/components/ui/Badge";
import { cn } from "@/shared/lib/cn";
import {
  getInactiveSubscriptionDestination,
  hasActiveSubscription,
} from "@/features/auth/lib/subscription";

export function ProductShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const scope = useAppSelector((state) => state.session.scope);
  const subscriptionStatus = useAppSelector((state) => state.session.subscriptionStatus);
  const activePlan = useAppSelector((state) => state.session.activePlan);

  useEffect(() => {
    if (subscriptionStatus === null) return;
    if (!hasActiveSubscription(subscriptionStatus, activePlan)) {
      router.replace(getInactiveSubscriptionDestination(subscriptionStatus));
      return;
    }
    if (scope !== "full") {
      router.replace(ROUTES.pricing);
    }
  }, [scope, subscriptionStatus, activePlan, router]);

  return (
    <div className="min-h-screen bg-[#070907] text-white lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="border-b border-white/10 bg-black px-5 py-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-6">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link href={ROUTES.home} aria-label="Bragi home"><BragiLogo /></Link>
          <Badge className="lg:mt-8">App preview</Badge>
        </div>
        <nav className="mt-6 grid gap-1 text-sm font-medium text-white/62 lg:mt-8">
          {productNav.map((item) => {
            const active = pathname === item.href || (item.href !== ROUTES.dashboard && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200",
                  active
                    ? "bg-[#7dc890]/12 text-white"
                    : "hover:bg-white/[0.06] hover:text-white"
                )}
                href={item.href}
              >
                {active ? (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#7dc890]" />
                ) : null}
                <span className="transition-all duration-200 group-hover:translate-x-0.5">{item.label}</span>
              </Link>
            );
          })}
        </nav>
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
