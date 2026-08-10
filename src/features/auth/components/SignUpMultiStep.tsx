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
import { selectPlan } from "@/store";
import { getPostAuthDestination } from "@/features/auth/lib/post-auth-routing";
import { apiClient } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { useRazorpayCheckout } from "@/features/subscription/hooks/useRazorpayCheckout";
import { paymentApi } from "@/features/subscription/services/paymentApi";

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
  password: yup.string().min(8, "Use at least 8 characters.").required("Password is required."),
});

const billingSchema = yup.object({
  registeredLegalName: yup.string().trim().required("Legal name is required."),
  gstin: yup.string().trim().required("GSTIN is required."),
  panNumber: yup.string().trim().required("PAN is required."),
  streetAddress: yup.string().trim().required("Address is required."),
  state: yup.string().trim().required("State is required."),
  postalCode: yup.string().trim().required("Postal code is required."),
  country: yup.string().trim().required("Country is required."),
});

type AccountValues = yup.InferType<typeof accountSchema>;
type BillingValues = yup.InferType<typeof billingSchema>;

import { useSubscriptionPlans, type DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";

export function SignUpMultiStep({
  plan,
  modeHref,
  returnTo,
  initSessionFn,
}: {
  plan: DynamicPlan | null;
  modeHref: (mode: any) => string;
  returnTo: string;
  initSessionFn: (data: any, email: string, isNewSignup: boolean) => Promise<any>;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const hasPlan = Boolean(plan);
  const resumingCheckout = returnTo.startsWith("/checkout");

  const [step, setStep] = useState<1 | 2>(1);
  const [accountData, setAccountData] = useState<AccountValues | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { initializePayment } = useRazorpayCheckout();

  const accountForm = useForm<AccountValues>({ resolver: yupResolver(accountSchema) });
  const billingForm = useForm<BillingValues>({ resolver: yupResolver(billingSchema) });

  const onAccountSubmit = (values: AccountValues) => {
    if (!plan && !resumingCheckout) {
      toast.message("Choose a plan to start your trial.");
      router.push(ROUTES.pricing);
      return;
    }
    setAccountData(values);
    setStep(2);
  };

  const onBillingSubmit = async (values: BillingValues) => {
    if (!accountData) return;

    setIsProcessing(true);
    try {
      // 1. Create Trial Auth
      const trialAuthResp = await paymentApi.createTrialAuth({
        name: accountData.company,
        superAdminEmail: accountData.email,
        superAdminName: accountData.fullName,
        industry: accountData.industry,
        adminPassword: accountData.password,
        planId: plan?.slug || "",
      });

      if (!trialAuthResp.orderId) {
        throw new Error("Failed to initialize Razorpay checkout");
      }

      // 2. Open Razorpay Checkout
      await new Promise<void>((resolve, reject) => {
        initializePayment(
          {
            key: trialAuthResp.keyId,
            amount: trialAuthResp.amountPaise,
            currency: trialAuthResp.currency,
            name: trialAuthResp.planName,
            description: "Free Trial Authorization",
            order_id: trialAuthResp.orderId,
            prefill: {
              name: accountData.fullName,
              email: accountData.email,
            },
          },
          async (response) => {
            try {
              // 3. Verify Trial Auth
              const verifyResp = await paymentApi.verifyTrialAuth({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                pendingTrialId: trialAuthResp.pendingTrialId,
              });

              const orgId = verifyResp.organizationId;
              if (!orgId) throw new Error("Organization ID missing after verification");

              // 4. Update Organization Profile with Billing Details
              await paymentApi.updateOrganizationProfile(orgId, values);

              // 5. Authenticate the new user
              const loginData = await apiClient<any>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email: accountData.email, password: accountData.password }),
              });

              // 6. Complete session initialization
              const sessionDetails = await initSessionFn(loginData, accountData.email, true);

              if (plan) dispatch(selectPlan(plan.slug));

              toast.success(resumingCheckout ? "Account created. Continue to billing." : "Trial started. Welcome to Bragi.");
              router.push(
                getPostAuthDestination({
                  isNewSignup: true,
                  subscriptionStatus: sessionDetails.subscriptionStatus,
                  returnTo,
                })
              );
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    } catch (err: any) {
      toast.error(err.message || err.description || "Failed to create account.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8">
      <BragiLogo />
      <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
        {step === 1 ? "Create your account" : "Billing details"}
      </h1>
      <p className="mt-3 text-sm text-white/58">
        {step === 1 ? (
          <>
            Already have one?{" "}
            <Link className="font-semibold text-[#a8dfb3] hover:text-white" href={modeHref("signin")}>
              Sign in
            </Link>
          </>
        ) : (
          "We'll issue a GST-compliant tax invoice to this entity."
        )}
      </p>

      {step === 1 && (
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
              <option value="" disabled>Select industry</option>
              {INDUSTRIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            {accountForm.formState.errors.industry?.message && (
              <span className="mt-2 block text-xs text-red-300">{accountForm.formState.errors.industry.message}</span>
            )}
          </label>
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            error={accountForm.formState.errors.password?.message}
            {...accountForm.register("password")}
          />
          {hasPlan || resumingCheckout ? (
            <Button className="mt-2 w-full" type="submit">Continue to Billing</Button>
          ) : (
            <Button className="mt-2 w-full" type="button" onClick={() => router.push(ROUTES.pricing)}>
              Choose a plan to continue
            </Button>
          )}
        </form>
      )}

      {step === 2 && (
        <form className="mt-8 grid gap-4" onSubmit={billingForm.handleSubmit(onBillingSubmit)}>
          <Input
            id="registeredLegalName"
            label="Registered legal name"
            error={billingForm.formState.errors.registeredLegalName?.message}
            {...billingForm.register("registeredLegalName")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="gstin"
              label="GSTIN"
              error={billingForm.formState.errors.gstin?.message}
              {...billingForm.register("gstin")}
            />
            <Input
              id="panNumber"
              label="PAN"
              error={billingForm.formState.errors.panNumber?.message}
              {...billingForm.register("panNumber")}
            />
          </div>
          <Input
            id="streetAddress"
            label="Billing address"
            error={billingForm.formState.errors.streetAddress?.message}
            {...billingForm.register("streetAddress")}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              id="state"
              label="State (Place of supply)"
              error={billingForm.formState.errors.state?.message}
              {...billingForm.register("state")}
            />
            <Input
              id="postalCode"
              label="Postal code"
              error={billingForm.formState.errors.postalCode?.message}
              {...billingForm.register("postalCode")}
            />
            <Input
              id="country"
              label="Country"
              error={billingForm.formState.errors.country?.message}
              {...billingForm.register("country")}
            />
          </div>

          <div className="mt-4 flex gap-4">
            <Button type="button" variant="secondary" className="w-1/3" onClick={() => setStep(1)} disabled={isProcessing}>
              Back
            </Button>
            <Button className="flex-1" type="submit" disabled={isProcessing}>
              {isProcessing ? "Processing..." : `Pay ₹1 & Activate`}
            </Button>
          </div>
        </form>
      )}

      {step === 1 && (
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
      )}
    </section>
  );
}
