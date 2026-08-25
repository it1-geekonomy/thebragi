"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { useAppDispatch } from "@/store/hooks";
import { apiClient, getApiErrorMessage } from "@/shared/lib/api-client";
import {
  initAuthSession,
  applyAuthSession,
  applyPendingSession,
  type AuthResponse,
} from "@/features/auth/lib/auth-session";
import { brand } from "@/config/brand";
import { TRIAL_AUTHORIZATION_PAISE, TRIAL_AUTHORIZATION_RUPEES } from "@/features/checkout/lib/order-math";
import { clearSignupDraft } from "@/features/checkout/lib/billing-session";
import { paymentApi } from "@/features/subscription/services/paymentApi";
import { useRazorpayCheckout, type RazorpaySuccessResponse } from "@/features/subscription/hooks/useRazorpayCheckout";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { type DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";
import type { BillingCycle, PurchaseMode } from "@/features/checkout/lib/checkout-params";
import { OAuthButtons } from "./OAuthButtons";
import {
  clearOAuthIdentityDraft,
  readOAuthIdentityDraft,
  saveOAuthIdentityDraft,
  type OAuthIdentityDraft,
} from "@/features/auth/lib/oauth";
import { completeOAuthSignup } from "@/features/auth/lib/complete-oauth-signup";
import { getPostAuthDestination } from "@/features/auth/lib/post-auth-routing";

const INDUSTRIES = [
  "Technology",
  "Professional services",
  "Manufacturing",
  "Retail & ecommerce",
  "Healthcare",
  "Education",
  "Other",
];

const accountSchema = yup.object({
  fullName: yup.string().trim().required("Full name is required."),
  email: yup.string().email("Enter a valid Email.").required("Email is required."),
  company: yup.string().trim().required("Company name is required."),
  industry: yup.string().required("Select an industry."),
  phone: yup
    .string()
    .trim()
    .matches(/^\+?[0-9\s\-()]{10,15}$/, "Enter a valid phone number")
    .required("Phone number is required."),
  password: yup.string().min(8, "Use at least 8 characters.").required("Password is required."),
});

type AccountValues = yup.InferType<typeof accountSchema>;
type AuthMode = "signin" | "signup";

export function SignUpMultiStep({
  plan,
  modeHref,
  returnTo,
  purchaseMode = "trial",
  cycle = "annual",
}: {
  plan: DynamicPlan | null;
  modeHref: (mode: AuthMode) => string;
  returnTo: string;
  purchaseMode?: PurchaseMode;
  cycle?: BillingCycle;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { initializePayment } = useRazorpayCheckout();
  const hasPlan = Boolean(plan);
  const resumingCheckout = returnTo.startsWith("/checkout");
  const [isProcessing, setIsProcessing] = useState(false);
  const [oauthIdentity, setOauthIdentity] = useState<OAuthIdentityDraft | null>(null);
  const [oauthFinishing, setOauthFinishing] = useState(false);

  useEffect(() => {
    setOauthIdentity(readOAuthIdentityDraft());
  }, []);

  useEffect(() => {
    if (!oauthIdentity || oauthFinishing) return;

    (async () => {
      setOauthFinishing(true);
      try {
        const next = await completeOAuthSignup({
          dispatch,
          oauth: oauthIdentity,
          plan,
          returnTo,
          purchaseMode,
          cycle,
        });
        toast.success(
          plan ? "Account ready. Continue to billing." : "Account ready. Choose a plan to continue.",
        );
        router.push(next);
      } catch (err: unknown) {
        clearOAuthIdentityDraft();
        setOauthIdentity(null);
        setOauthFinishing(false);
        toast.error(getApiErrorMessage(err, "Could not continue with social signup."));
      }
    })();
  }, [oauthIdentity, oauthFinishing, plan, dispatch, returnTo, router, purchaseMode, cycle]);

  const accountForm = useForm<AccountValues>({
    resolver: yupResolver(accountSchema),
    mode: "onChange",
  });

  const onAccountSubmit = async (values: AccountValues) => {
    setIsProcessing(true);
    let shouldReset = true;
    try {
      if (plan) {
        let trialAuth: Awaited<ReturnType<typeof paymentApi.resumeTrialAuth>> | null = null;
        let isResuming = false;

        try {
          trialAuth = await paymentApi.resumeTrialAuth({
            email: values.email,
            password: values.password,
          });
          isResuming = true;
        } catch (err: unknown) {
          const status = err && typeof err === "object" && "status" in err ? Number(err.status) : 0;
          const message = err instanceof Error ? err.message : "";
          if (status === 404 || message.includes("404")) {
            // expected: no pending signup
          } else {
            throw err;
          }
        }

        if (isResuming && trialAuth) {
          shouldReset = false;
          clearSignupDraft();

          const razorpayKey = trialAuth?.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
          if (!razorpayKey.startsWith("rzp_test_") && process.env.NODE_ENV !== "production") {
            toast.error("Local checkout requires a Razorpay test key (rzp_test_…).");
            setIsProcessing(false);
            return;
          }

          const orderId = trialAuth?.orderId ?? trialAuth?.id;
          if (!orderId) {
            toast.error("Missing trial order id. Please try again.");
            setIsProcessing(false);
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
              prefill: { email: values.email, name: values.company },
              theme: { color: brand.colors.greenBright },
            },
            async (response: RazorpaySuccessResponse) => {
              await paymentApi.verifyTrialAuth({
                ...response,
                pendingTrialId: trialAuth.pendingTrialId,
              });

              const loginData = await apiClient<AuthResponse>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email: values.email, password: values.password, appType: "website" }),
              });

              await initAuthSession(dispatch, loginData, values.email, true);
              router.push(ROUTES.billingConfirmation);
            },
            (error) => {
              toast.error(error?.message || "Payment cancelled.");
              setIsProcessing(false);
              router.push(ROUTES.pricing);
            },
          );
          return;
        }

        const captured = await paymentApi.captureSignup({
          name: values.company,
          superAdminEmail: values.email,
          superAdminName: values.fullName,
          industry: values.industry,
          adminPassword: values.password,
          planId: plan.id,
          phone: values.phone,
          billingCycle: cycle,
          authProvider: "local",
        });

        applyPendingSession(dispatch, {
          fullName: values.fullName,
          email: values.email,
          company: values.company,
          industry: values.industry,
          password: values.password,
          phone: values.phone,
          pendingTrialId: captured.pendingTrialId,
          planId: plan.id,
          planSlug: plan.slug,
          purchaseMode,
          cycle,
          authProvider: "local",
        });

        toast.success("Account created. Continue to billing to buy your plan.");
        const checkoutPath = returnTo.startsWith("/checkout")
          ? returnTo
          : ROUTES.checkout(plan.slug, { cycle, mode: purchaseMode });
        router.push(checkoutPath);
      } else {
        await paymentApi.captureSignup({
          name: values.company,
          superAdminEmail: values.email,
          superAdminName: values.fullName,
          industry: values.industry,
          adminPassword: values.password,
          phone: values.phone,
          authProvider: "local",
        });

        applyPendingSession(dispatch, {
          fullName: values.fullName,
          email: values.email,
          company: values.company,
          industry: values.industry,
          password: values.password,
          phone: values.phone,
          authProvider: "local",
        });
        toast.success("Account created. Now choose a plan.");
        router.push(ROUTES.pricing);
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Could not create account."));
      if (!shouldReset) setIsProcessing(false);
    } finally {
      if (shouldReset) setIsProcessing(false);
    }
  };

  if (oauthIdentity || oauthFinishing) {
    return (
      <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8">
        <BragiLogo />
        <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Create your account</h1>
        <p className="mt-6 rounded-md border border-[#7dc890]/25 bg-[#7dc890]/10 px-3 py-2 text-sm text-[#bce8c5]">
          Continuing with {oauthIdentity?.authProvider === "microsoft" ? "Microsoft" : "Google"}
          {oauthIdentity?.email ? (
            <>
              {" "}
              as <span className="font-semibold">{oauthIdentity.email}</span>
            </>
          ) : null}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
          <p className="text-sm text-white/58">
            {plan
              ? "Saving your account — billing details come next."
              : "Saving your account — choose a plan next."}
          </p>
        </div>
      </section>
    );
  }

  const handleOAuthSuccess = async (data: AuthResponse, provider: "google" | "microsoft") => {
    try {
      setIsProcessing(true);

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
          purchaseMode,
          cycle,
        });
        toast.success(
          plan ? "Account ready. Continue to billing." : "Account ready. Choose a plan to continue.",
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
        toast.success("Signed in successfully.");
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
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Social sign-in failed."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8">
      <BragiLogo />
      <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Create your account</h1>
      <p className="mt-3 text-sm text-white/58">
        Already have one?{" "}
        <Link className="font-semibold text-[#a8dfb3] hover:text-white" href={modeHref("signin")} replace>
          Sign in
        </Link>
      </p>

      <div className="mt-6">
        <OAuthButtons onOAuthSuccess={handleOAuthSuccess} disabled={isProcessing} />
        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/35">or continue with email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={accountForm.handleSubmit(onAccountSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="fullName"
            label="Full name"
            autoComplete="name"
            error={accountForm.formState.errors.fullName?.message}
            {...accountForm.register("fullName")}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={accountForm.formState.errors.email?.message}
            {...accountForm.register("email")}
          />
        </div>
        <Input
          id="company"
          label="Company name"
          autoComplete="organization"
          error={accountForm.formState.errors.company?.message}
          {...accountForm.register("company")}
        />
        <label className="block text-sm text-white/72" htmlFor="industry">
          <span className="mb-2 block font-medium">Industry</span>
          <Select id="industry" className="w-full" defaultValue="" {...accountForm.register("industry")}>
            <option value="" disabled>
              Select industry
            </option>
            {INDUSTRIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          {accountForm.formState.errors.industry?.message && (
            <span className="mt-2 block text-xs text-red-300">{accountForm.formState.errors.industry.message}</span>
          )}
        </label>
        <Input
          id="phone"
          label="Phone number"
          autoComplete="tel"
          error={accountForm.formState.errors.phone?.message}
          {...accountForm.register("phone")}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={accountForm.formState.errors.password?.message}
          {...accountForm.register("password")}
        />
        <Button className="mt-2 w-full" type="submit" disabled={isProcessing}>
          {isProcessing
            ? "Continuing..."
            : hasPlan || resumingCheckout
              ? "Create account & continue"
              : "Create account & choose plan"}
        </Button>
      </form>

      <p className="mt-4 text-xs leading-5 text-white/38">
        By continuing you agree to the{" "}
        <Link className="text-white/58 hover:text-white" href={ROUTES.legal.terms}>
          Terms
        </Link>{" "}
        and{" "}
        <Link className="text-white/58 hover:text-white" href={ROUTES.legal.privacy}>
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}
