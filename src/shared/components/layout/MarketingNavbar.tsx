"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { marketingNav } from "@/config/nav";
import { ROUTES } from "@/config/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileNavOpen, clearSession } from "@/store";
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
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = session.userName
    ? session.userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

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
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5f9965] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6bad72] hover:shadow-lg hover:shadow-[#5f9965]/20"
              >
                {initials}
              </button>
              {profileOpen ? (
                <div className="absolute right-0 top-12 w-56 rounded-xl border border-white/[0.08] bg-[#0a100a] p-2 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-white/[0.06] px-3 py-3">
                    <p className="text-sm font-semibold text-white">{session.userName ?? "User"}</p>
                    <p className="mt-0.5 text-xs text-white/38">Signed in</p>
                  </div>
                  <div className="mt-1 grid gap-0.5">
                    {session.scope === "full" ? (
                      <Link href={ROUTES.dashboard} onClick={() => setProfileOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-white/72 transition hover:bg-white/8 hover:text-white">Dashboard</Link>
                    ) : (
                      <Link href={ROUTES.pricing} onClick={() => setProfileOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-white/72 transition hover:bg-white/8 hover:text-white">Choose a plan</Link>
                    )}
                    <Link href={ROUTES.account.profile} onClick={() => setProfileOpen(false)} className="block rounded-md px-3 py-2.5 text-sm text-white/72 transition hover:bg-white/8 hover:text-white">Account settings</Link>
                    <button
                      onClick={() => {
                        dispatch(clearSession());
                        setProfileOpen(false);
                        localStorage.removeItem("accessToken");
                        router.push(ROUTES.home);
                      }}
                      className="w-full rounded-md px-3 py-2.5 text-left text-sm text-white/38 transition hover:bg-white/8 hover:text-white/72"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
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
            {session.isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 rounded-md px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5f9965] text-xs font-semibold text-white">{initials}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{session.userName ?? "User"}</p>
                    <p className="text-xs text-white/38">Signed in</p>
                  </div>
                </div>
                {session.scope === "full" ? (
                  <Link className="rounded-md px-3 py-2 hover:bg-white/8" href={ROUTES.dashboard} onClick={() => dispatch(setMobileNavOpen(false))}>Dashboard</Link>
                ) : (
                  <Link className="rounded-md px-3 py-2 hover:bg-white/8" href={ROUTES.pricing} onClick={() => dispatch(setMobileNavOpen(false))}>Choose a plan</Link>
                )}
                <Link className="rounded-md px-3 py-2 hover:bg-white/8" href={ROUTES.account.profile} onClick={() => dispatch(setMobileNavOpen(false))}>Account settings</Link>
                <button className="w-full rounded-md px-3 py-2 text-left text-white/44 hover:bg-white/8 hover:text-white/72" onClick={() => { dispatch(clearSession()); dispatch(setMobileNavOpen(false)); localStorage.removeItem("accessToken"); }}>Sign out</button>
              </>
            ) : (
              <>
                <Link className="rounded-md px-3 py-2 hover:bg-white/8" href={ROUTES.signIn} onClick={() => dispatch(setMobileNavOpen(false))}>Sign in</Link>
                <Link className="rounded-md bg-[#5f9965] px-3 py-2 font-semibold text-white" href={ROUTES.pricing} onClick={() => dispatch(setMobileNavOpen(false))}>See plans</Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
