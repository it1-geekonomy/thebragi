"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { useAppDispatch } from "@/store/hooks";
import { apiClient, getApiErrorMessage } from "@/shared/lib/api-client";
import { initAuthSession, applyPendingSession, type AuthResponse } from "@/features/auth/lib/auth-session";
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
  phone: yup.string().trim().matches(/^\+?[0-9\s\-()]{10,15}$/, "Enter a valid phone number").required("Phone number is required."),
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

  const accountForm = useForm<AccountValues>({
    resolver: yupResolver(accountSchema),
    mode: "onChange",
  });

  const onAccountSubmit = async (values: AccountValues) => {
    setIsProcessing(true);
    let shouldReset = true;
    try {
      if (plan) {
        let trialAuth: any = null;
        let isResuming = false;
        
        try {
          // Check if there is an existing pending signup to resume
          trialAuth = await paymentApi.resumeTrialAuth({
            email: values.email,
            password: values.password,
          });
          isResuming = true;
        } catch (err: any) {
          if (err?.status === 404 || err?.message?.includes("404")) {
            // expected: no pending signup, continue normal flow
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
                body: JSON.stringify({ email: values.email, password: values.password }),
              });

              await initAuthSession(dispatch, loginData, values.email, true);
              router.push(ROUTES.billingConfirmation);
            },
            (error) => {
              toast.error(error?.message || "Payment cancelled.");
              setIsProcessing(false);
              router.push(ROUTES.pricing);
            }
          );
          return;
        }

        // Normal new signup: capture-signup -> save draft -> checkout
        const captured = await paymentApi.captureSignup({
          name: values.company,
          superAdminEmail: values.email,
          superAdminName: values.fullName,
          industry: values.industry,
          adminPassword: values.password,
          planId: plan.id,
          phone: values.phone,
          billingCycle: cycle,
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
        });

        toast.success("Account created. Continue to billing to buy your plan.");
        const checkoutPath = returnTo.startsWith("/checkout")
          ? returnTo
          : ROUTES.checkout(plan.slug, { cycle, mode: purchaseMode });
        router.push(checkoutPath);
      } else {
        // Path 2: no plan — save draft locally, org created at checkout
        applyPendingSession(dispatch, {
          fullName: values.fullName,
          email: values.email,
          company: values.company,
          industry: values.industry,
          password: values.password,
          phone: values.phone,
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

      <form className="mt-8 grid gap-4" onSubmit={accountForm.handleSubmit(onAccountSubmit)}>
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
