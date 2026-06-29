"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordValues>({ resolver: yupResolver(passwordSchema) });
  return (
    <form className="grid gap-5" onSubmit={handleSubmit(async () => toast.success("Signed in for this frontend preview."))}>
      <Input id="email" label="Work email" type="email" error={errors.email?.message} {...register("email")} />
      <Input id="password" label="Password" type="password" error={errors.password?.message} {...register("password")} />
      <Button disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</Button>
    </form>
  );
}

function OtpMode() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpRequestValues>({ resolver: yupResolver(otpRequestSchema) });
  const { register: registerVerify, handleSubmit: handleSubmitVerify, formState: { errors: errorsVerify, isSubmitting: isSubmittingVerify } } = useForm<OtpVerifyValues>({ resolver: yupResolver(otpVerifySchema) });

  if (sent) {
    return (
      <form className="grid gap-5" onSubmit={handleSubmitVerify(async () => {
        toast.success("Verified! Signed in for this frontend preview.");
      })}>
        <Alert tone="success">A mock code was sent. Check your email.</Alert>
        <Input id="otp-code" label="Confirmation code" type="text" error={errorsVerify.code?.message} {...registerVerify("code")} />
        <Button disabled={isSubmittingVerify}>{isSubmittingVerify ? "Verifying..." : "Verify"}</Button>
      </form>
    );
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(async () => {
      setSent(true);
      toast.success("Mock OTP sent.");
    })}>
      <Input id="otp-email" label="Work email" type="email" error={errors.email?.message} {...register("email")} />
      <Button disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send OTP"}</Button>
    </form>
  );
}

export function SignInForm() {
  return <Tabs tabs={[{ label: "Password", content: <PasswordMode /> }, { label: "OTP", content: <OtpMode /> }]} />;
}
