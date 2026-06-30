"use client";

import Link from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { setCheckoutStep, setCheckoutData, setMockSession } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { StepIndicator } from "@/shared/components/ui/StepIndicator";
import { Alert } from "@/shared/components/ui/Alert";
import { Tabs } from "@/shared/components/ui/Tabs";
import { planCatalog } from "@/config/plans";
import { ROUTES } from "@/config/routes";
import { formatCurrency } from "@/shared/lib/format-currency";
import { usePlans } from "@/features/pricing/hooks/usePlans";
import Script from "next/script";

const accountSchema = yup.object({
  email: yup.string().email("Enter a valid email.").required("Work email is required."),
  name: yup.string().required("Full name is required."),
  company: yup.string().required("Company is required."),
  teamSize: yup.string().required("Team size is required."),
});

const signInSchema = yup.object({
  email: yup.string().email("Enter a valid email.").required("Work email is required."),
  password: yup.string().min(8, "Use at least 8 characters.").required("Password is required."),
});

const otpSchema = yup.object({
  code: yup.string().length(6, "Enter the 6 digit code.").required("Code is required."),
});

type AccountValues = yup.InferType<typeof accountSchema>;
type SignInValues = yup.InferType<typeof signInSchema>;
type OtpValues = yup.InferType<typeof otpSchema>;

function AccountStep({ planId }: { planId?: string }) {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AccountValues>({ resolver: yupResolver(accountSchema) });

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit(async (values) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            superAdminName: values.name,
            superAdminEmail: values.email,
            name: values.company,
            teamSize: values.teamSize,
            planId: planId,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Registration failed");
        }
        const data = await res.json();
        dispatch(setCheckoutData({
          organizationId: data.organization.id,
          userEmail: values.email,
        }));
        dispatch(setCheckoutStep("verify"));
      } catch (err: any) {
        toast.error(err.message);
      }
    })}>
      <Input id="email" label="Work email" type="email" error={errors.email?.message} {...register("email")} />
      <Input id="name" label="Full name" error={errors.name?.message} {...register("name")} />
      <Input id="company" label="Company" error={errors.company?.message} {...register("company")} />
      <label className="text-sm text-white/72">
        <span className="mb-2 block font-medium">Team size</span>
        <Select {...register("teamSize")} defaultValue="">
          <option value="" disabled>Select team size</option>
          <option value="1-5">1-5</option>
          <option value="6-20">6-20</option>
          <option value="21-50">21-50</option>
          <option value="51+">51+</option>
        </Select>
        {errors.teamSize?.message ? <span className="mt-2 block text-xs text-red-300">{errors.teamSize.message}</span> : null}
      </label>
      <Button disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Continue to verification"}</Button>
    </form>
  );
}

function SignInStep() {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInValues>({ resolver: yupResolver(signInSchema) });

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit(async () => {
      toast.success("Signed in for this frontend preview.");
      dispatch(setCheckoutStep("payment"));
    })}>
      <Input id="signin-email" label="Work email" type="email" error={errors.email?.message} {...register("email")} />
      <Input id="signin-password" label="Password" type="password" error={errors.password?.message} {...register("password")} />
      <Button disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in and continue"}</Button>
    </form>
  );
}

function OtpStep() {
  const dispatch = useAppDispatch();
  const userEmail = useAppSelector((state) => state.checkout.userEmail);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpValues>({ resolver: yupResolver(otpSchema) });

  useEffect(() => {
    if (userEmail) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      }).catch(console.error);
    }
  }, [userEmail]);

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit(async (values) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, otp: values.code }),
        });
        if (!res.ok) throw new Error("Invalid code");
        toast.success("Email verified!");
        dispatch(setCheckoutStep("payment"));
      } catch (err: any) {
        toast.error(err.message);
      }
    })}>
      <Alert tone="info">Check your email for the verification code.</Alert>
      <Input id="code" label="Verification code" inputMode="numeric" maxLength={6} error={errors.code?.message} {...register("code")} />
      <div className="flex flex-wrap gap-3">
        <Button disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify code"}</Button>
        <Button type="button" variant="secondary" onClick={() => {
           fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp/send`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ email: userEmail }),
           }).then(() => toast.success("Code resent!"));
        }}>Resend code</Button>
      </div>
    </form>
  );
}

function PaymentStep({ planSlug }: { planSlug?: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { organizationId, userEmail } = useAppSelector((state) => state.checkout);
  const { plans } = usePlans();
  const plan = plans.find((item) => item.slug === planSlug) ?? plans[2];
  const planId = plan?.id;
  const [isPaying, setIsPaying] = useState(false);

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, planId }),
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Bragi",
        description: `${plan.name} Subscription`,
        handler: async (response: any) => {
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/razorpay/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              organizationId,
              planId,
            }),
          });
          if (!verifyRes.ok) throw new Error("Payment verification failed");
          
          dispatch(setMockSession({ isAuthenticated: true, scope: "full", activePlan: plan.slug }));
          router.push("/checkout/success");
        },
        prefill: {
          email: userEmail,
        },
        theme: { color: "#7dc890" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function () {
        setIsPaying(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message);
      setIsPaying(false);
    }
  };

  return (
    <div className="mt-8 grid gap-5">
      <Alert tone="success">Verification complete. You can now securely complete your payment.</Alert>
      <div className="rounded-lg border border-white/10 bg-black/35 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-white/48">Billed monthly. Terms apply.</p>
          </div>
          <p className="text-2xl font-semibold text-white">{formatCurrency(plan.priceMonthly)}</p>
        </div>
      </div>
      <Button disabled={isPaying} onClick={handlePayment}>
        {isPaying ? "Processing..." : `Pay ${formatCurrency(plan.priceMonthly)}`}
      </Button>
    </div>
  );
}

export function CheckoutStepper({ planSlug }: { planSlug?: string }) {
  const step = useAppSelector((state) => state.checkout.step);
  const isAuthenticated = useAppSelector((state) => state.session.isAuthenticated);
  const dispatch = useAppDispatch();
  const activeStep = step === "account" ? 0 : step === "verify" ? 1 : 2;
  const [mode, setMode] = useState<"new" | "signin">("new");
  
  const { plans } = usePlans();
  const planId = plans.find((item) => item.slug === planSlug)?.id;

  const { organizationId } = useAppSelector((state) => state.checkout);

  useEffect(() => {
    if (isAuthenticated && organizationId && (step === "account" || step === "verify")) {
      dispatch(setCheckoutStep("payment"));
    }
  }, [isAuthenticated, organizationId, step, dispatch]);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
      <StepIndicator steps={["Account", "Verify", "Payment"]} active={activeStep} />
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Checkout</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Complete your Bragi setup</h1>
        <p className="mt-3 text-sm leading-6 text-white/58">This frontend flow mirrors the production checkout path without calling backend services yet.</p>
      </div>
      {step === "account" ? (
        <Tabs tabs={[
          { label: "New account", content: <div onClick={() => setMode("new")}><AccountStep planId={planId} /></div> },
          { label: "Sign in", content: <div onClick={() => setMode("signin")}><SignInStep /></div> },
        ]} />
      ) : null}
      {step === "verify" ? <OtpStep /> : null}
      {step === "payment" ? <PaymentStep planSlug={planSlug} /> : null}
      <p className="mt-6 text-xs text-white/34">Mode: {mode === "new" ? "new checkout account" : "returning account"}</p>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
