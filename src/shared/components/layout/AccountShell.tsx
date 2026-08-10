"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { Badge } from "@/shared/components/ui/Badge";
import { cn } from "@/shared/lib/cn";

import { BackButton } from "@/shared/components/ui/BackButton";
import { useAppSelector } from "@/store/hooks";
import { hasActiveSubscription } from "@/features/auth/lib/subscription";

const accountLinks = [
  { label: "Profile", href: ROUTES.account.profile, description: "Identity and company" },
  { label: "Billing", href: ROUTES.account.billing, description: "Plan and invoices" },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAppSelector((state) => state.session);
  const active = hasActiveSubscription(session.subscriptionStatus, session.activePlan);

  useEffect(() => {
    if (!session.isAuthenticated) {
      router.replace(ROUTES.signIn);
    }
  }, [session.isAuthenticated, router]);

  if (!session.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#070907] text-white">
      <header className="border-b border-white/10 bg-black px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href={ROUTES.home} aria-label="Bragi home"><BragiLogo /></Link>
          <div className="flex items-center gap-3">
            {active ? (
              <Link className="hidden text-sm font-semibold text-white/62 hover:text-white sm:inline" href={ROUTES.dashboard}>Open app</Link>
            ) : null}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <BackButton />
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-4 sm:px-8 lg:grid-cols-[260px_1fr]">
        <aside className="content-start rounded-lg border border-white/10 bg-white/[0.035] p-3 lg:sticky lg:top-24 lg:self-start">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7dc890]">Account</p>
          <nav className="mt-2 grid gap-2 text-sm">
            {accountLinks.map((link) => (
              <Link key={link.href} className={cn("rounded-md px-3 py-3 text-white/62 hover:bg-white/8 hover:text-white", pathname === link.href && "bg-[#7dc890]/12 text-white")} href={link.href}>
                <span className="block font-semibold">{link.label}</span>
                <span className="mt-1 block text-xs text-white/38">{link.description}</span>
              </Link>
            ))}
          </nav>
        </aside>
        {children}
      </div>
    </div>
  );
}
