"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "../api";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { useAppDispatch } from "@/store/hooks";
import { setMockSession } from "@/store";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Alert } from "@/shared/components/ui/Alert";

const passwordSchema = yup.object({
  email: yup.string().email("Enter a valid email.").required("Work email is required."),
  password: yup.string().min(8, "Use at least 8 characters.").required("Password is required."),
});

const otpRequestSchema = yup.object({
  email: yup.string().email("Enter a valid email.").required("Work email is required."),
});

const otpVerifySchema = yup.object({
  code: yup.string().required("Confirmation code is required."),
});

type PasswordValues = yup.InferType<typeof passwordSchema>;
type OtpRequestValues = yup.InferType<typeof otpRequestSchema>;
type OtpVerifyValues = yup.InferType<typeof otpVerifySchema>;

function PasswordMode() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordValues>({ resolver: yupResolver(passwordSchema) });
  return (
    <form className="grid gap-5" onSubmit={handleSubmit(async (values) => {
      dispatch(setMockSession({ isAuthenticated: true, userName: values.email.split("@")[0], scope: "full" }));
      toast.success("Signed in successfully.");
      router.push("/");
    })}>
      <Input id="email" label="Work email" type="email" error={errors.email?.message} {...register("email")} />
      <Input id="password" label="Password" type="password" error={errors.password?.message} {...register("password")} />
      <Button disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</Button>
    </form>
  );
}

function OtpMode() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpRequestValues>({ resolver: yupResolver(otpRequestSchema) });
  const { register: registerVerify, handleSubmit: handleSubmitVerify, formState: { errors: errorsVerify, isSubmitting: isSubmittingVerify } } = useForm<OtpVerifyValues>({ resolver: yupResolver(otpVerifySchema) });

  if (sent) {
    return (
      <form className="grid gap-5" onSubmit={handleSubmitVerify(async (values) => {
        try {
          const data = await verifyOtp(email, values.code);
          localStorage.setItem("accessToken", data.accessToken);
          dispatch(setMockSession({ isAuthenticated: true, userName: data.user?.name ?? email.split("@")[0], scope: "full" }));
          toast.success("Verified! Signed in successfully.");
          router.push("/");
        } catch (err: any) {
          toast.error(err.message || "Failed to verify OTP.");
        }
      })}>
        <Alert tone="success">A code was sent. Check your email.</Alert>
        <Input id="otp-code" label="Confirmation code" type="text" error={errorsVerify.code?.message} {...registerVerify("code")} />
        <Button disabled={isSubmittingVerify}>{isSubmittingVerify ? "Verifying..." : "Verify"}</Button>
        <Button variant="ghost" type="button" onClick={() => setSent(false)}>Change Email</Button>
      </form>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(async (values) => {
      try {
        await sendOtp(values.email);
        setEmail(values.email);
        setSent(true);
        toast.success("OTP sent to your email.");
      } catch (err: any) {
        toast.error(err.message || "Failed to send OTP.");
      }
    })}>
      <Input id="otp-email" label="Work email" type="email" error={errors.email?.message} {...register("email")} />
      <Button disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send OTP"}</Button>
    </form>
  );
}

function DummySignIn({ label, userName, scope, activePlan }: { label: string; userName: string; scope: "checkout" | "full", activePlan?: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        dispatch(setMockSession({ isAuthenticated: true, userName, scope, activePlan: activePlan || null }));
        toast.success(`Signed in as ${userName}`);
        router.push("/");
      }}
      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-medium text-white/78 transition hover:border-white/20 hover:bg-white/[0.07]"
    >
      <span className="block font-semibold text-white">{label}</span>
      <span className="mt-0.5 block text-xs text-white/44">{userName}</span>
    </button>
  );
}

export function SignInForm() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/44">Quick logins</p>
        <DummySignIn label="Subscribed user" userName="Riya Sharma" scope="full" activePlan="bragi-full" />
        <DummySignIn label="Non-subscribed user" userName="Alex Rivera" scope="checkout" />
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
        <div className="relative flex justify-center"><span className="bg-black px-3 text-xs text-white/38">or sign in with email</span></div>
      </div>
      <Tabs tabs={[{ label: "Password", content: <PasswordMode /> }, { label: "OTP", content: <OtpMode /> }]} />
    </div>
  );
}
