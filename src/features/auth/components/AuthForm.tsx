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
import { initAuthSession, type AuthResponse } from "@/features/auth/lib/auth-session";
import { apiClient } from "@/shared/lib/api-client";
import { brand } from "@/config/brand";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { formatCurrency } from "@/shared/lib/format-currency";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { cn } from "@/shared/lib/cn";
import { SignUpMultiStep } from "./SignUpMultiStep";
import { getApiErrorMessage } from "@/shared/lib/api-client";
import { useSubscriptionPlans, type DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";
import { paymentApi } from "@/features/subscription/services/paymentApi";
import { BackButton } from "@/shared/components/ui/BackButton";
import { clearSignupDraft } from "@/features/checkout/lib/billing-session";
import { TRIAL_AUTHORIZATION_PAISE, TRIAL_AUTHORIZATION_RUPEES } from "@/features/checkout/lib/order-math";
import { useRazorpayCheckout, type RazorpaySuccessResponse } from "@/features/subscription/hooks/useRazorpayCheckout";

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


function PasswordMode({ returnTo, plans }: { returnTo: string; plans: DynamicPlan[] }) {
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
              body: JSON.stringify({ email: values.email, password: values.password }),
            });

            if (data.code === "PAYMENT_PENDING") {
              setIsResumingTrial(true);
              clearSignupDraft();

              const trialAuth = await paymentApi.resumeTrialAuth({
                email: values.email,
                password: values.password,
              });

              const razorpayKey =
                trialAuth?.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
              if (!razorpayKey.startsWith("rzp_test_") && process.env.NODE_ENV !== "production") {
                toast.error("Local checkout requires a Razorpay test key (rzp_test_…).");
                setIsResumingTrial(false);
                return;
              }

              const orderId = trialAuth?.orderId ?? trialAuth?.id;
              if (!orderId) {
                toast.error("Missing trial order id. Please try again.");
                setIsResumingTrial(false);
                return;
              }

              await initializePayment(
                {
                  key: razorpayKey,
                  currency: trialAuth?.currency ?? "INR",
                  amount:
                    typeof trialAuth?.amountPaise === "number"
                      ? trialAuth.amountPaise
                      : TRIAL_AUTHORIZATION_PAISE,
                  order_id: orderId,
                  name: brand.name,
                  description: `Free trial authorization — INR ${TRIAL_AUTHORIZATION_RUPEES}`,
                  prefill: { email: values.email, name: values.email.split("@")[0] },
                  theme: { color: brand.colors.greenBright },
                },
                async (response: RazorpaySuccessResponse) => {
                  await paymentApi.verifyTrialAuth({
                    ...response,
                    pendingTrialId: trialAuth.pendingTrialId,
                  });

                  const loginData = await apiClient<AuthResponse>("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ email: values.email, password: values.password }),
                  });

                  await initAuthSession(dispatch, loginData, values.email, true);
                  router.push(ROUTES.billingConfirmation);
                },
                (error) => {
                  toast.error(error?.message || "Payment cancelled.");
                  setIsResumingTrial(false);
                  router.push(ROUTES.pricing);
                },
              );

              return;
            }

            const sessionDetails = await initAuthSession(dispatch, data, values.email, false);
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
}: {
  returnTo: string;
  modeHref: (mode: AuthMode) => string;
  plans: DynamicPlan[];
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
        <PasswordMode returnTo={returnTo} plans={plans} />
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
          {showPlan
            ? buyNow
              ? "Sign in or create an account to buy this plan. Your selection is saved."
              : "Sign in or create an account to start a 14-day trial. Your plan selection is saved."
            : mode === "signup"
              ? "Create an account, then choose a plan to activate your workspace."
              : "Sign in to open your workspace, or finish checkout if payment is still pending."}
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
          <SignUpMultiStep
            plan={plan}
            modeHref={modeHref}
            returnTo={returnTo}
            purchaseMode={purchaseMode === "buy_now" ? "buy_now" : "trial"}
            cycle={billingCycle}
          />
        ) : (
          <SignInPanel returnTo={returnTo} modeHref={modeHref} plans={plans} />
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
