"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { marketingNav } from "@/config/nav";
import { ROUTES } from "@/config/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileNavOpen } from "@/store";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { CTAButton } from "@/shared/components/marketing/CTAButton";
import { DropdownMenu } from "@/shared/components/ui/DropdownMenu";
import { cn } from "@/shared/lib/cn";

type NavLink = { label: string; href: string };

function getMobileLinks(): NavLink[] {
  return marketingNav.flatMap((item) => {
    if ("items" in item && item.items) return item.items;
    return [{ label: item.label, href: item.href }];
  });
}

export function MarketingNavbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const mobileOpen = useAppSelector((state) => state.ui.mobileNavOpen);
  const session = useAppSelector((state) => state.session);
  const mobileLinks = getMobileLinks();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href={ROUTES.home} aria-label="Bragi home"><BragiLogo /></Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-white/72 lg:flex">
          {marketingNav.map((item) => item.items ? (
            <DropdownMenu key={item.label} label={item.label} items={item.items.map((child) => ({ ...child, description: child.label.includes("Full") ? "Sales and projects together" : child.label.includes("Sales") ? "Pipeline and deal flow" : "Delivery and task flow" }))} />
          ) : (
            <Link key={item.href} className={cn("transition hover:text-white", pathname === item.href && "text-white")} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {session.isAuthenticated ? (
            <>
              <Link className="text-sm font-semibold text-white/70 hover:text-white" href={ROUTES.account.profile}>Account</Link>
              <CTAButton href={ROUTES.dashboard}>Open app</CTAButton>
            </>
          ) : (
            <>
              <Link className="text-sm font-semibold text-white/70 hover:text-white" href={ROUTES.signIn}>Sign in</Link>
              <CTAButton href={ROUTES.pricing}>See plans</CTAButton>
            </>
          )}
        </div>
        <button className="rounded-md border border-white/12 px-3 py-2 text-sm font-semibold text-white lg:hidden" onClick={() => dispatch(setMobileNavOpen(!mobileOpen))} aria-expanded={mobileOpen} aria-controls="mobile-nav">
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>
      {mobileOpen ? (
        <div id="mobile-nav" className="border-t border-white/10 px-5 py-4 lg:hidden">
          <nav className="grid gap-2 text-sm text-white/76">
            {mobileLinks.map((item) => <Link key={item.href} className={cn("rounded-md px-3 py-2 hover:bg-white/8", pathname === item.href && "bg-white/8 text-white")} href={item.href} onClick={() => dispatch(setMobileNavOpen(false))}>{item.label}</Link>)}
            <Link className="rounded-md px-3 py-2 hover:bg-white/8" href={session.isAuthenticated ? ROUTES.account.profile : ROUTES.signIn} onClick={() => dispatch(setMobileNavOpen(false))}>{session.isAuthenticated ? "Account" : "Sign in"}</Link>
            <Link className="rounded-md bg-[#5f9965] px-3 py-2 font-semibold text-white" href={session.isAuthenticated ? ROUTES.dashboard : ROUTES.pricing} onClick={() => dispatch(setMobileNavOpen(false))}>{session.isAuthenticated ? "Open app" : "See plans"}</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
