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
import { selectPlan, setMockSession, type AppDispatch } from "@/store";
import { fetchAuthSessionDetails, getPostAuthDestination } from "@/features/auth/lib/post-auth-routing";

import { createTrialWindow } from "@/features/auth/lib/trial-dates";
import { apiClient } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { formatCurrency } from "@/shared/lib/format-currency";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { cn } from "@/shared/lib/cn";
import { SignUpMultiStep } from "./SignUpMultiStep";
import { useSubscriptionPlans, type DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";

const INDUSTRIES = [
  "Technology",
  "Professional services",
  "Manufacturing",
  "Retail & ecommerce",
  "Healthcare",
  "Education",
  "Other",
];

const signUpSchema = yup.object({
  fullName: yup.string().trim().required("Full name is required."),
  email: yup.string().email("Enter a valid Email.").required("Email is required."),
  company: yup.string().trim().required("Company name is required."),
  industry: yup.string().required("Select an industry."),
  password: yup.string().min(8, "Use at least 8 characters.").required("Password is required."),
});

const passwordSchema = yup.object({
  email: yup.string().email("Enter a valid email.").required("Email is required."),
  password: yup.string().min(8, "Use at least 8 characters.").required("Password is required."),
});

type SignUpValues = yup.InferType<typeof signUpSchema>;
type PasswordValues = yup.InferType<typeof passwordSchema>;
type AuthMode = "signin" | "signup";

function trialEndsLabel() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function authHref(mode: AuthMode, plan?: string | null, returnTo?: string | null) {
  const params = new URLSearchParams();
  if (mode === "signup") params.set("mode", "signup");
  if (plan) params.set("plan", plan);
  if (returnTo) params.set("returnTo", returnTo);
  const query = params.toString();
  return query ? `${ROUTES.signIn}?${query}` : ROUTES.signIn;
}


async function initAuthSession(
  dispatch: AppDispatch,
  data: { accessToken?: string; user?: any; requires_org_selection?: boolean; session_key?: string; orgs?: { id: string }[] },
  email: string,
  isNewSignup: boolean = false,
) {
  await applyAuthSession(dispatch, data, email);

  const token = localStorage.getItem("accessToken") ?? "";
  const sessionDetails = await fetchAuthSessionDetails(token);

  dispatch(
    setMockSession({
      isNewSignup,
      subscriptionStatus: sessionDetails.subscriptionStatus,
      activePlan: sessionDetails.activePlan,
      organizationId: sessionDetails.organizationId,
    }),
  );

  return sessionDetails;
}

async function applyAuthSession(
  dispatch: AppDispatch,
  data: { accessToken?: string; user?: any; requires_org_selection?: boolean; session_key?: string; orgs?: { id: string }[] },
  email: string,
) {
  const rawToken = (data.accessToken ?? "").replace(/^Bearer\s+/i, "");
  localStorage.setItem("accessToken", rawToken);

  if (data.requires_org_selection) {
    const orgs = data.orgs ?? [];
    const selected = await apiClient<{ accessToken: string; user: any }>("/auth/select-organization", {
      method: "POST",
      body: JSON.stringify({ sessionKey: data.session_key, organizationId: orgs[0]?.id }),
    });
    const selectedToken = (selected.accessToken ?? "").replace(/^Bearer\s+/i, "");
    localStorage.setItem("accessToken", selectedToken);
    dispatch(
      setMockSession({
        isAuthenticated: true,
        userEmail: email,
        userName: selected.user?.name ?? email.split("@")[0],
        scope: "full",
        organizationId: selected.user?.organizationId ?? orgs[0]?.id,
      }),
    );
    return;
  }

  dispatch(
    setMockSession({
      isAuthenticated: true,
      userEmail: email,
      userName: data.user?.name ?? email.split("@")[0],
      scope: "full",
      organizationId: data.user?.organizationId ?? null,
    }),
  );
}

function PasswordMode({ returnTo }: { returnTo: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
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
            const data = await apiClient<{ accessToken: string; user: any }>("/auth/login", {
              method: "POST",
              body: JSON.stringify({ email: values.email, password: values.password }),
            });
            const sessionDetails = await initAuthSession(dispatch, data as any, values.email, false);
            
            router.push(
              getPostAuthDestination({
                isNewSignup: false,
                subscriptionStatus: sessionDetails.subscriptionStatus,
                returnTo,
              }),
            );
            toast.success("Signed in successfully.");
          } catch (err: any) {
            toast.error(err.message || "Invalid email or password.");
          }
        })}
    >
      <Input id="signin-email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Input id="signin-password" label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
      
      <div className="flex items-center justify-end -mt-2">
        <Link 
          href={process.env.NEXT_PUBLIC_CRM_APP_URL ? `${process.env.NEXT_PUBLIC_CRM_APP_URL}/auth/forgot-password` : "http://localhost:3000/auth/forgot-password"} 
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


function SignInPanel({ returnTo, modeHref }: { returnTo: string; modeHref: (mode: AuthMode) => string }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8">
      <BragiLogo />
      <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Sign in to Bragi</h1>
      <p className="mt-3 text-sm text-white/58">
        No account yet?{" "}
        <Link className="font-semibold text-[#a8dfb3] hover:text-white" href={modeHref("signup")}>
          Create account
        </Link>
        {" · "}
        <Link className="font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>
          Choose a plan
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


function PlanSummaryAside({ plan, buyNow }: { plan: DynamicPlan | null; buyNow?: boolean }) {
  if (!plan) return null;

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
              <dd className="font-medium text-white/84">{formatCurrency(plan.priceMonthly)}/mo</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/48">Additional Users</dt>
              <dd className="font-medium text-white/84">+{formatCurrency(plan.perUserCostMonthly)}/mo per user</dd>
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
              <dd className="font-medium text-white/84">{formatCurrency(plan.priceMonthly)}/mo</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/48">Additional Users</dt>
              <dd className="font-medium text-white/84">+{formatCurrency(plan.perUserCostMonthly)}/mo per user</dd>
            </div>
          </>
        )}
      </dl>

      <p className="mt-6 text-xs leading-5 text-white/38">
        {buyNow
          ? "After sign-in you’ll confirm billing & GST details, then pay. Plan selection is preserved."
          : "No card required. We’ll remind you 3 days before the trial ends. Your data stays for 30 days after expiry."}
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
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { plans, loading } = useSubscriptionPlans();
  const mode: AuthMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const planSlug = searchParams.get("plan");
  const plan = plans.find((p) => p.slug === planSlug) || null;
  const returnTo = searchParams.get("returnTo") || ROUTES.dashboard;
  const buyNow = returnTo.startsWith("/checkout");
  const modeHref = (next: AuthMode) => authHref(next, planSlug, searchParams.get("returnTo"));
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
      <div className="mb-8">
        <div className="inline-flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">2</span>
          <p className="text-sm font-semibold text-white">{mode === "signup" ? "Create account" : "Sign in"}</p>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">
          {buyNow
            ? "Sign in or create an account to continue to billing. Your plan selection is saved."
            : mode === "signup"
              ? showPlan
                ? "Industry is asked because it drives the preset recommendation later — not for your marketing database."
                : "Create your account, then pick a plan when you’re ready to start a trial."
              : "Use your Bragi account to open the app, or create one after choosing a plan."}
        </p>
        {buyNow ? (
          <p className="mt-2 text-xs text-white/38">
            <Link className="font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>
              ← Back to plans
            </Link>
          </p>
        ) : null}
        <div className="mt-5 inline-flex rounded-full border border-white/12 bg-white/[0.04] p-1">
          <Link
            href={modeHref("signin")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              mode === "signin" ? "bg-[#5f9965] text-white" : "text-white/58 hover:text-white",
            )}
          >
            Sign in
          </Link>
          <Link
            href={modeHref("signup")}
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
          <SignUpMultiStep 
            plan={plan} 
            modeHref={modeHref} 
            returnTo={returnTo} 
            initSessionFn={(data, email, isNewSignup) => initAuthSession(dispatch, data, email, isNewSignup)} 
          />
        ) : (
          <SignInPanel returnTo={returnTo} modeHref={modeHref} />
        )}
        {showPlan ? <PlanSummaryAside plan={plan} buyNow={buyNow} /> : null}
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
