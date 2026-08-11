"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { useAppDispatch } from "@/store/hooks";
import {
  getPostAuthDestination,
  sanitizeReturnTo,
} from "@/features/auth/lib/post-auth-routing";
import { applyPendingSession, initAuthSession, type AuthResponse } from "@/features/auth/lib/auth-session";
import { apiClient } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { formatCurrency } from "@/shared/lib/format-currency";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { cn } from "@/shared/lib/cn";
import { SignUpMultiStep } from "./SignUpMultiStep";
import { getApiErrorMessage } from "@/shared/lib/api-client";
import { useSubscriptionPlans, type DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";
import { BackButton } from "@/shared/components/ui/BackButton";

const passwordSchema = yup.object({
  email: yup.string().email("Enter a valid email.").required("Email is required."),
  password: yup.string().min(8, "Use at least 8 characters.").required("Password is required."),
});

type PasswordValues = yup.InferType<typeof passwordSchema>;
type AuthMode = "signin" | "signup";
function getPurchaseMode(returnTo: string, purchaseMode?: string | null) {
  if (purchaseMode === "trial" || purchaseMode === "buy_now") return purchaseMode;
  if (!returnTo.startsWith("/checkout")) return null;
  return new URLSearchParams(returnTo.split("?")[1] ?? "").get("mode");
}

function trialEndsLabel() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function authHref(
  mode: AuthMode,
  plan?: string | null,
  returnTo?: string | null,
  purchaseMode?: string | null,
) {
  const params = new URLSearchParams();
  if (mode === "signup") params.set("mode", "signup");
  if (plan) params.set("plan", plan);
  if (returnTo) params.set("returnTo", returnTo);
  if (purchaseMode === "trial" || purchaseMode === "buy_now") params.set("purchaseMode", purchaseMode);
  const query = params.toString();
  return query ? `${ROUTES.signIn}?${query}` : ROUTES.signIn;
}


function PasswordMode({ returnTo }: { returnTo: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: yupResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      className="grid gap-5"
        onSubmit={handleSubmit(async (values) => {
          try {
            const data = await apiClient<AuthResponse>("/auth/login", {
              method: "POST",
              body: JSON.stringify({ email: values.email, password: values.password }),
            });

            if (data.code === "PAYMENT_PENDING") {
              applyPendingSession(dispatch, {
                fullName: data.user?.name || values.email.split("@")[0],
                email: values.email,
                company: data.user?.company || values.email,
                industry: "",
                password: values.password,
                resume: true,
              });
              toast.success("Signed in. Choose a plan to activate your workspace.");
              router.push(
                getPostAuthDestination({
                  isNewSignup: false,
                  subscriptionStatus: "none",
                  returnTo,
                }),
              );
              return;
            }

            const sessionDetails = await initAuthSession(dispatch, data, values.email, false);
            
            router.push(
              getPostAuthDestination({
                isNewSignup: false,
                subscriptionStatus: sessionDetails.subscriptionStatus,
                activePlan: sessionDetails.activePlan,
                returnTo,
              }),
            );
            toast.success("Signed in successfully.");
          } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, "Invalid email or password."));
          }
        })}
    >
      <Input id="signin-email" label="Email" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
      <Input id="signin-password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" error={errors.password?.message} {...register("password")} />
      
      <div className="flex items-center justify-end -mt-2">
        <Link 
          href={ROUTES.forgotPassword} 
          className="text-xs font-semibold text-[#a8dfb3] hover:text-white"
        >
          Forgot password?
        </Link>
      </div>

      <Button className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}


function SignInPanel({ returnTo, modeHref, hasPlan }: { returnTo: string; modeHref: (mode: AuthMode) => string; hasPlan: boolean }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8">
      <BragiLogo />
      <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Sign in to Bragi</h1>
      <p className="mt-3 text-sm text-white/58">
        No account yet?{" "}
        <Link className="font-semibold text-[#a8dfb3] hover:text-white" href={hasPlan ? modeHref("signup") : ROUTES.pricing} replace={hasPlan}>
          Create account
        </Link>
      </p>

      <GoogleButton label="Continue with Google" />

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/28">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <PasswordMode returnTo={returnTo} />
    </section>
  );
}


function PlanSummaryAside({
  plan,
  buyNow,
  billingCycle = "annual",
}: {
  plan: DynamicPlan | null;
  buyNow?: boolean;
  billingCycle?: "monthly" | "annual";
}) {
  if (!plan) return null;

  const isAnnual = billingCycle === "annual";
  const basePrice = isAnnual ? plan.priceAnnual : plan.priceMonthly;
  const perUser = isAnnual ? plan.perUserCostAnnual : plan.perUserCostMonthly;
  const period = isAnnual ? "/yr" : "/mo";

  return (
    <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
          <p className="mt-1 text-sm text-white/52">{plan.description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#7dc890]/30 bg-[#7dc890]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#bce8c5]">
          {buyNow ? "Buy now" : "14-day trial"}
        </span>
      </div>

      <dl className="mt-6 grid gap-3 text-sm">
        {buyNow ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
              <dt className="text-white/48">Base Price</dt>
              <dd className="font-medium text-white/84">
                {formatCurrency(basePrice)}
                {period}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/48">Additional Users</dt>
              <dd className="font-medium text-white/84">
                +{formatCurrency(perUser)}
                {period} per user
              </dd>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
              <dt className="text-white/48">Trial ends</dt>
              <dd className="font-medium text-white/84">{trialEndsLabel()}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
              <dt className="text-white/48">Then (Base)</dt>
              <dd className="font-medium text-white/84">
                {formatCurrency(basePrice)}
                {period}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/48">Additional Users</dt>
              <dd className="font-medium text-white/84">
                +{formatCurrency(perUser)}
                {period} per user
              </dd>
            </div>
          </>
        )}
      </dl>

      <p className="mt-6 text-xs leading-5 text-white/38">
        {buyNow
          ? "After sign-in you’ll confirm billing & GST details, then pay. Plan selection is preserved."
          : "After account creation you’ll confirm billing & GST, then authorize INR 1 to start the trial."}
      </p>

      <Link className="mt-5 inline-flex text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>
        Change plan
      </Link>
    </aside>
  );
}

function GoogleButton({ label }: { label: string }) {
  const [pending, setPending] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      className="mt-6 w-full gap-2"
      disabled={pending}
      onClick={() => {
        setPending(true);
        toast.message("Google sign-in is not wired yet.");
        setTimeout(() => setPending(false), 600);
      }}
    >
      <GoogleMark />
      {label}
    </Button>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#EA4335" d="M9 7.2v3.5h4.9c-.2 1.1-.8 2-1.7 2.6l2.8 2.2c1.6-1.5 2.6-3.7 2.6-6.3 0-.6-.1-1.2-.2-1.8H9z" />
      <path fill="#34A853" d="M4.1 10.7l-.6.5-2.2 1.7C2.7 15.3 5.6 17.2 9 17.2c2.4 0 4.4-.8 5.9-2.2l-2.8-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8z" />
      <path fill="#4A90E2" d="M1.3 5.1C.8 6.1.5 7.3.5 8.6c0 1.3.3 2.5.8 3.5l2.8-2.2c-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5L1.3 5.1z" />
      <path fill="#FBBC05" d="M9 3.5c1.3 0 2.5.5 3.4 1.3l2.5-2.5C13.4.9 11.4 0 9 0 5.6 0 2.7 1.9 1.3 4.7l2.8 2.2C4.6 5.1 6.6 3.5 9 3.5z" />
    </svg>
  );
}

function AuthFormContent() {
  const searchParams = useSearchParams();
  const { plans, loading } = useSubscriptionPlans();
  const mode: AuthMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const planSlug = searchParams.get("plan");
  const plan = plans.find((p) => p.slug === planSlug) || null;
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo")) || ROUTES.dashboard;
  const purchaseMode = getPurchaseMode(returnTo, searchParams.get("purchaseMode"));
  const buyNow = purchaseMode === "buy_now";
  const billingCycle = searchParams.get("cycle") === "monthly" ? "monthly" : "annual";
  const modeHref = (next: AuthMode) => authHref(next, planSlug, searchParams.get("returnTo"), purchaseMode);
  const showPlan = Boolean(plan);

  if (loading) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
      </main>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <BackButton />
      </div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-3">
          <p className="text-sm font-semibold text-white">{mode === "signup" ? "Create account" : "Sign in"}</p>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-6 text-white/70">
          Sign in or create an account to continue to billing. Your plan selection is saved.
        </p>
        {/* Removed duplicate back link */}
        <div className="mt-5 inline-flex rounded-full border border-white/12 bg-white/[0.04] p-1">
          <Link
            href={modeHref("signin")}
            replace
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              mode === "signin" ? "bg-[#5f9965] text-white" : "text-white/58 hover:text-white",
            )}
          >
            Sign in
          </Link>
          <Link
            href={modeHref("signup")}
            replace
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              mode === "signup" ? "bg-[#5f9965] text-white" : "text-white/58 hover:text-white",
            )}
          >
            Create account
          </Link>
        </div>
      </div>

      <div className={cn("grid gap-8", showPlan ? "lg:grid-cols-[1.15fr_0.85fr] lg:items-start" : "max-w-xl")}>
        {mode === "signup" ? (
          !showPlan ? (
            <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8 text-center">
              <div className="flex justify-center">
                <BragiLogo />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-white">Select a plan to start</h1>
              <p className="mt-3 text-sm text-white/58 mb-6">
                You need to choose a subscription plan before creating an account.
              </p>
              <Link
                href={ROUTES.pricing}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#5f9965] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6bad72]"
              >
                See plans
              </Link>
            </section>
          ) : (
            <SignUpMultiStep plan={plan} modeHref={modeHref} returnTo={returnTo} />
          )
        ) : (
          <SignInPanel returnTo={returnTo} modeHref={modeHref} hasPlan={showPlan} />
        )}
        {showPlan ? <PlanSummaryAside plan={plan} buyNow={buyNow} billingCycle={billingCycle} /> : null}
      </div>
    </div>
  );
}

export function AuthForm() {
  return (
    <Suspense fallback={null}>
      <AuthFormContent />
    </Suspense>
  );
}
