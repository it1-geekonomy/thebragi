"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { sendOtp, verifyOtp } from "../api";
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
  const [email, setEmail] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpRequestValues>({ resolver: yupResolver(otpRequestSchema) });
  const { register: registerVerify, handleSubmit: handleSubmitVerify, formState: { errors: errorsVerify, isSubmitting: isSubmittingVerify } } = useForm<OtpVerifyValues>({ resolver: yupResolver(otpVerifySchema) });

  if (sent) {
    return (
      <form className="grid gap-5" onSubmit={handleSubmitVerify(async (values) => {
        try {
          const data = await verifyOtp(email, values.code);
          localStorage.setItem("accessToken", data.accessToken);
          toast.success("Verified! Signed in successfully.");
          // TODO: Redirect or dispatch user data to Redux
          window.location.href = "/dashboard"; // Adjust the URL based on app flow
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

export function SignInForm() {
  return <Tabs tabs={[{ label: "Password", content: <PasswordMode /> }, { label: "OTP", content: <OtpMode /> }]} />;
}
