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
import {
  applyAuthSession,
  applyPendingSession,
  initAuthSession,
  type AuthResponse,
} from "@/features/auth/lib/auth-session";
import { apiClient, getApiErrorMessage } from "@/shared/lib/api-client";
import { brand } from "@/config/brand";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { formatCurrency } from "@/shared/lib/format-currency";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { cn } from "@/shared/lib/cn";
import { SignUpMultiStep } from "./SignUpMultiStep";
import { OAuthButtons } from "./OAuthButtons";
import { useSubscriptionPlans, type DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";
import { paymentApi } from "@/features/subscription/services/paymentApi";
import { BackButton } from "@/shared/components/ui/BackButton";
import { clearSignupDraft, saveSignupDraft } from "@/features/checkout/lib/billing-session";
import { buildCheckoutPath } from "@/features/checkout/lib/checkout-params";
import { TRIAL_AUTHORIZATION_PAISE, TRIAL_AUTHORIZATION_RUPEES } from "@/features/checkout/lib/order-math";
import { useRazorpayCheckout, type RazorpaySuccessResponse } from "@/features/subscription/hooks/useRazorpayCheckout";
import {
  clearOAuthIdentityDraft,
  saveOAuthIdentityDraft,
  type OAuthIdentityDraft,
} from "@/features/auth/lib/oauth";
import { completeOAuthSignup } from "@/features/auth/lib/complete-oauth-signup";

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

function PasswordMode({ returnTo }: { returnTo: string; plans: DynamicPlan[] }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { initializePayment } = useRazorpayCheckout();
  const [isResumingTrial, setIsResumingTrial] = useState(false);
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
            body: JSON.stringify({ email: values.email, password: values.password, appType: "website" }),
          });

          if (data.code === "PAYMENT_PENDING") {
            const pendingDetails = await paymentApi.getPendingSignup(values.email).catch(() => null);
            saveSignupDraft({
              email: values.email,
              password: values.password,
              company: pendingDetails?.company || pendingDetails?.name || "",
              fullName: pendingDetails?.name || values.email.split("@")[0],
              industry: pendingDetails?.industry || "Technology",
              resume: true,
              planId: pendingDetails?.planId || undefined,
            });

            toast.info("Please review your plan and authorize checkout to continue.");
            const targetPlan = pendingDetails?.planId || "growth";
            const targetPath = returnTo?.startsWith("/checkout")
              ? returnTo
              : buildCheckoutPath({ plan: targetPlan, mode: "trial", cycle: "monthly", users: 10 });

            router.push(targetPath);
            return;
          }

          const sessionDetails = await initAuthSession(dispatch, data, values.email, false);
          if (sessionDetails.requiresOrgSelection) {
            router.push(ROUTES.selectOrganization);
            return;
          }

          const destination = getPostAuthDestination({
            isNewSignup: false,
            subscriptionStatus: sessionDetails.subscriptionStatus,
            activePlan: sessionDetails.activePlan,
            returnTo,
          });
          router.push(destination);
          toast.success(
            sessionDetails.subscriptionStatus === "trialing"
              ? "Signed in. Your trial is still active."
              : sessionDetails.subscriptionStatus === "expired"
                ? "Signed in. Renew your plan to keep using Bragi."
                : "Signed in successfully.",
          );
        } catch (err: unknown) {
          toast.error(getApiErrorMessage(err, "Invalid email or password."));
        }
      })}
    >
      <Input
        id="signin-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="signin-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-end -mt-2">
        <Link href={ROUTES.forgotPassword} className="text-xs font-semibold text-[#a8dfb3] hover:text-white">
          Forgot password?
        </Link>
      </div>

      <Button className="w-full" disabled={isSubmitting || isResumingTrial}>
        {isResumingTrial ? "Opening checkout..." : isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

function SignInPanel({
  returnTo,
  modeHref,
  plans,
  onOAuthSuccess,
}: {
  returnTo: string;
  modeHref: (mode: AuthMode) => string;
  plans: DynamicPlan[];
  onOAuthSuccess: (data: AuthResponse, provider: "google" | "microsoft") => void | Promise<void>;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8">
      <BragiLogo />
      <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Sign in to Bragi</h1>
      <p className="mt-3 text-sm text-white/58">
        No account yet?{" "}
        <Link className="font-semibold text-[#a8dfb3] hover:text-white" href={modeHref("signup")} replace>
          Create account
        </Link>
      </p>

      <div className="mt-6">
        <OAuthButtons onOAuthSuccess={onOAuthSuccess} />

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/35">or continue with password</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="mt-5">
          <PasswordMode returnTo={returnTo} plans={plans} />
        </div>
      </div>
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
          {buyNow ? "Buy now" : "14-day trial (limit 5 users)"}
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

function AuthFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
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
  const [oauthBusy, setOauthBusy] = useState(false);

  const handleOAuthSuccess = async (data: AuthResponse, provider: "google" | "microsoft") => {
    try {
      setOauthBusy(true);

      if (data.code === "PAYMENT_PENDING") {
        const email = data.user?.email || data.email || "";
        const fullName = data.user?.name || data.name || email.split("@")[0] || "User";
        applyPendingSession(dispatch, {
          fullName,
          email,
          company: data.user?.company || email,
          industry: "",
          password: "",
          resume: true,
          authProvider: provider,
          providerUserId: data.providerUserId,
          emailVerified: true,
          pendingTrialId: data.pendingTrialId,
        });
        toast.success("Account recognized. Choose a plan to activate your workspace.");
        router.push(ROUTES.pricing);
        return;
      }

      if (data.code === "OAUTH_SIGNUP_REQUIRED") {
        const email = data.email || data.user?.email || "";
        const name = data.name || data.user?.name || email.split("@")[0] || "User";
        const oauth: OAuthIdentityDraft = {
          authProvider: provider,
          providerUserId: data.providerUserId || "",
          email,
          name,
          emailVerified: true,
        };
        saveOAuthIdentityDraft(oauth);

        const next = await completeOAuthSignup({
          dispatch,
          oauth,
          plan,
          returnTo,
          purchaseMode: buyNow ? "buy_now" : "trial",
          cycle: billingCycle,
        });
        toast.success(
          plan
            ? `Signed in with ${provider === "microsoft" ? "Microsoft" : "Google"}. Continue to billing.`
            : `Signed in with ${provider === "microsoft" ? "Microsoft" : "Google"}. Choose a plan to continue.`,
        );
        router.push(next);
        return;
      }

      if (data.requires_org_selection) {
        const email = data.user?.email || data.email || "";
        await applyAuthSession(dispatch, data, email);
        router.push(ROUTES.selectOrganization);
        return;
      }

      if (data.accessToken) {
        clearOAuthIdentityDraft();
        const email = data.user?.email || data.email || "";
        const sessionDetails = await initAuthSession(dispatch, data, email, false);
        if (sessionDetails.requiresOrgSelection) {
          router.push(ROUTES.selectOrganization);
          return;
        }
        toast.success(
          sessionDetails.subscriptionStatus === "trialing"
            ? "Signed in. Your trial is still active."
            : sessionDetails.subscriptionStatus === "expired"
              ? "Signed in. Renew your plan to keep using Bragi."
              : "Signed in successfully.",
        );
        router.push(
          getPostAuthDestination({
            isNewSignup: false,
            subscriptionStatus: sessionDetails.subscriptionStatus,
            activePlan: sessionDetails.activePlan,
            returnTo,
          }),
        );
        return;
      }

      toast.error(data.message || "Social sign-in failed.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Social sign-in failed."));
    } finally {
      setOauthBusy(false);
    }
  };

  if (oauthBusy || loading) {
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
          {showPlan
            ? buyNow
              ? "Sign in or create an account to buy this plan. Your selection is saved."
              : "Sign in or create an account to start a 14-day trial (limit 5 users). Your plan selection is saved."
            : mode === "signup"
              ? "Create an account, then choose a plan to activate your workspace."
              : "Sign in to open your workspace, or finish checkout if payment is still pending."}
        </p>
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
          <SignUpMultiStep
            plan={plan}
            modeHref={modeHref}
            returnTo={returnTo}
            purchaseMode={purchaseMode === "buy_now" ? "buy_now" : "trial"}
            cycle={billingCycle}
          />
        ) : (
          <SignInPanel returnTo={returnTo} modeHref={modeHref} plans={plans} onOAuthSuccess={handleOAuthSuccess} />
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
