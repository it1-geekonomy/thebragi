"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOtp, verifyOtp } from "../api";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { useAppDispatch } from "@/store/hooks";
import { setMockSession } from "@/store";
import { apiClient } from "@/shared/lib/api-client";
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
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordValues>({ resolver: yupResolver(passwordSchema) });
  return (
    <form className="grid gap-5" onSubmit={handleSubmit(async (values) => {
      try {
        const data = await apiClient<{ accessToken: string; user: any }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: values.email, password: values.password }),
        });

        // Backend prefixes token with "Bearer " — strip it for raw storage
        const rawToken = (data.accessToken ?? "").replace(/^Bearer\s+/i, "");
        localStorage.setItem("accessToken", rawToken);

        if ((data as any).requires_org_selection) {
          // Auto-select the first org for the checkout flow
          const orgs: { id: string }[] = (data as any).orgs ?? [];
          const selected = await apiClient<{ accessToken: string; user: any }>("/auth/select-organization", {
            method: "POST",
            body: JSON.stringify({ sessionKey: (data as any).session_key, organizationId: orgs[0]?.id }),
          });
          const selectedToken = (selected.accessToken ?? "").replace(/^Bearer\s+/i, "");
          localStorage.setItem("accessToken", selectedToken);
          dispatch(setMockSession({ isAuthenticated: true, userEmail: values.email, userName: selected.user?.name ?? values.email.split("@")[0], scope: "full", organizationId: selected.user?.organizationId ?? orgs[0]?.id }));
        } else {
          dispatch(setMockSession({ isAuthenticated: true, userEmail: values.email, userName: data.user?.name ?? values.email.split("@")[0], scope: "full", organizationId: data.user?.organizationId ?? null }));
        }

        toast.success("Signed in successfully.");
        router.push(returnTo);
      } catch (err: any) {
        toast.error(err.message || "Invalid email or password.");
      }
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
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpRequestValues>({ resolver: yupResolver(otpRequestSchema) });
  const { register: registerVerify, handleSubmit: handleSubmitVerify, formState: { errors: errorsVerify, isSubmitting: isSubmittingVerify } } = useForm<OtpVerifyValues>({ resolver: yupResolver(otpVerifySchema) });

  if (sent) {
    return (
      <form className="grid gap-5" onSubmit={handleSubmitVerify(async (values) => {
        try {
          const data = await verifyOtp(email, values.code);

          // Backend prefixes token with "Bearer " — strip it for raw storage
          const rawToken = (data.accessToken ?? "").replace(/^Bearer\s+/i, "");
          localStorage.setItem("accessToken", rawToken);

          if ((data as any).requires_org_selection) {
            // Auto-select the first org for the checkout flow
            const orgs: { id: string }[] = (data as any).orgs ?? [];
            const selected = await apiClient<{ accessToken: string; user: any }>("/auth/select-organization", {
              method: "POST",
              body: JSON.stringify({ sessionKey: (data as any).session_key, organizationId: orgs[0]?.id }),
            });
            const selectedToken = (selected.accessToken ?? "").replace(/^Bearer\s+/i, "");
            localStorage.setItem("accessToken", selectedToken);
            dispatch(setMockSession({ isAuthenticated: true, userEmail: email, userName: selected.user?.name ?? email.split("@")[0], scope: "full", organizationId: selected.user?.organizationId ?? orgs[0]?.id }));
          } else {
            dispatch(setMockSession({ isAuthenticated: true, userEmail: email, userName: data.user?.name ?? email.split("@")[0], scope: "full", organizationId: data.user?.organizationId ?? null }));
          }

          toast.success("Verified! Signed in successfully.");
          router.push(returnTo);
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
  return (
    <Suspense fallback={null}>
      <SignInFormContent />
    </Suspense>
  );
}

function SignInFormContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  return (
    <div className="grid gap-5">
      <Tabs tabs={[{ label: "Password", content: <PasswordMode /> }, { label: "OTP", content: <OtpMode /> }]} />
    </div>
  );
}
