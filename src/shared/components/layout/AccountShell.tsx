"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { cn } from "@/shared/lib/cn";
import { BackButton } from "@/shared/components/ui/BackButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSession } from "@/store";
import { clearSignupDraft } from "@/features/checkout/lib/billing-session";
import { hasActiveSubscription } from "@/features/auth/lib/subscription";

const accountLinks = [
  { label: "Profile", href: ROUTES.account.profile, description: "Identity and company" },
  { label: "Billing", href: ROUTES.account.billing, description: "Plan and invoices" },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.session);
  const active = hasActiveSubscription(session.subscriptionStatus, session.activePlan);
  const links = active ? accountLinks : accountLinks.filter((link) => link.href !== ROUTES.account.billing);

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

  useEffect(() => {
    if (!session.isAuthenticated) {
      router.replace(ROUTES.signIn);
      return;
    }
    if (!active && pathname === ROUTES.account.billing) {
      router.replace(ROUTES.account.profile);
    }
  }, [session.isAuthenticated, active, pathname, router]);

  if (!session.isAuthenticated) {
    return null;
  }

  const initials = session.userName
    ? session.userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen bg-[#070907] text-white">
      <header className="border-b border-white/10 bg-black px-5 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href={ROUTES.home} aria-label="Bragi home">
            <BragiLogo />
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5f9965] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6bad72] hover:shadow-lg hover:shadow-[#5f9965]/20"
                aria-label="User menu"
              >
                {initials}
              </button>
              {profileOpen ? (
                <div className="absolute right-0 top-12 w-56 rounded-xl border border-white/[0.08] bg-[#0a100a] p-2 shadow-2xl backdrop-blur-xl z-50">
                  <div className="border-b border-white/[0.06] px-3 py-3">
                    <p className="text-sm font-semibold text-white truncate">{session.userName ?? "User"}</p>
                    <p className="mt-0.5 text-xs text-white/38 truncate">{session.userEmail ?? "Signed in"}</p>
                  </div>
                  <div className="mt-1 grid gap-0.5">
                    {active ? (
                      <a
                        href={ROUTES.appWorkspace}
                        className="block rounded-md px-3 py-2.5 text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
                      >
                        Open workspace
                      </a>
                    ) : (
                      <Link
                        href={ROUTES.pricing}
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
                      >
                        Choose a plan
                      </Link>
                    )}
                    <Link
                      href={ROUTES.account.profile}
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      Account settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(clearSession());
                        setProfileOpen(false);
                        localStorage.removeItem("accessToken");
                        clearSignupDraft();
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
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <BackButton />
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-4 sm:px-8 lg:grid-cols-[260px_1fr]">
        <aside className="content-start rounded-lg border border-white/10 bg-white/[0.035] p-3 lg:sticky lg:top-24 lg:self-start">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7dc890]">
            Account
          </p>
          <nav className="mt-2 grid gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                className={cn(
                  "rounded-md px-3 py-3 text-white/62 hover:bg-white/8 hover:text-white",
                  pathname === link.href && "bg-[#7dc890]/12 text-white",
                )}
                href={link.href}
              >
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
