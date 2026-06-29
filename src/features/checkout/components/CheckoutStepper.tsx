"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { setCheckoutStep } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { StepIndicator } from "@/shared/components/ui/StepIndicator";
import { Alert } from "@/shared/components/ui/Alert";
import { Tabs } from "@/shared/components/ui/Tabs";
import { planCatalog } from "@/config/plans";
import { formatCurrency } from "@/shared/lib/format-currency";

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

function AccountStep() {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AccountValues>({ resolver: yupResolver(accountSchema) });

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit(async () => {
      toast.success("Account details saved for this frontend preview.");
      dispatch(setCheckoutStep("verify"));
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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpValues>({ resolver: yupResolver(otpSchema) });

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit(async () => {
      toast.success("Email verified for this frontend preview.");
      dispatch(setCheckoutStep("payment"));
    })}>
      <Alert tone="info">Use any 6 digit code to continue. Backend OTP verification will replace this mock action.</Alert>
      <Input id="code" label="Verification code" inputMode="numeric" maxLength={6} error={errors.code?.message} {...register("code")} />
      <div className="flex flex-wrap gap-3">
        <Button disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify code"}</Button>
        <Button type="button" variant="secondary" onClick={() => toast.info("A new mock code would be sent.")}>Resend code</Button>
      </div>
    </form>
  );
}

function PaymentStep({ planSlug }: { planSlug?: string }) {
  const dispatch = useAppDispatch();
  const plan = planCatalog.find((item) => item.slug === planSlug) ?? planCatalog[2];

  return (
    <div className="mt-8 grid gap-5">
      <Alert tone="success">Verification complete. This payment step is Razorpay-ready but uses a frontend mock action for now.</Alert>
      <div className="rounded-lg border border-white/10 bg-black/35 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-white/48">Billed monthly. Terms apply.</p>
          </div>
          <p className="text-2xl font-semibold text-white">{formatCurrency(plan.priceMonthly)}</p>
        </div>
      </div>
      <Button onClick={() => {
        toast.success("Mock payment completed.");
        dispatch(setCheckoutStep("success"));
      }}>Pay {formatCurrency(plan.priceMonthly)}</Button>
    </div>
  );
}

function SuccessStep() {
  return (
    <div className="mt-8 grid gap-5">
      <Alert tone="success">Checkout preview complete. The production flow will redirect to the success/provisioning page.</Alert>
      <div className="rounded-lg border border-[#7dc890]/25 bg-[#7dc890]/10 p-6">
        <h3 className="text-xl font-semibold text-white">Workspace queued for setup</h3>
        <p className="mt-3 text-sm leading-6 text-white/62">Next, backend provisioning will create the workspace, then send the user into onboarding.</p>
      </div>
    </div>
  );
}

export function CheckoutStepper({ planSlug }: { planSlug?: string }) {
  const step = useAppSelector((state) => state.checkout.step);
  const activeStep = step === "account" ? 0 : step === "verify" ? 1 : 2;
  const [mode, setMode] = useState<"new" | "signin">("new");

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
          { label: "New account", content: <div onClick={() => setMode("new")}><AccountStep /></div> },
          { label: "Sign in", content: <div onClick={() => setMode("signin")}><SignInStep /></div> },
        ]} />
      ) : null}
      {step === "verify" ? <OtpStep /> : null}
      {step === "payment" ? <PaymentStep planSlug={planSlug} /> : null}
      {step === "success" ? <SuccessStep /> : null}
      <p className="mt-6 text-xs text-white/34">Mode: {mode === "new" ? "new checkout account" : "returning account"}</p>
    </div>
  );
}
