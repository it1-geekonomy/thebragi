"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { ROUTES } from "@/config/routes";
import { BackButton } from "@/shared/components/ui/BackButton";

const resetPasswordSchema = yup.object({
  email: yup.string().email("Enter a valid email.").required("Email is required."),
  password: yup.string().min(8, "Use at least 8 characters.").required("Password is required."),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

type ResetPasswordValues = yup.InferType<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { email: emailFromUrl, password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md">
        <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8 text-center">
          <BragiLogo />
          <h1 className="mt-6 text-xl font-semibold text-white">Invalid Reset Link</h1>
          <p className="mt-3 text-sm text-white/58">
            The password reset link is invalid or missing the token. Please request a new one.
          </p>
          <Button className="mt-6" onClick={() => router.push(ROUTES.forgotPassword)}>
            Request New Link
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <BackButton />
      </div>
      <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8">
        <BragiLogo />
        <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Set new password</h1>
        <p className="mt-3 text-sm text-white/58 mb-6">
          Please enter your new password below.
        </p>

        <form
          className="grid gap-5"
          onSubmit={handleSubmit(async (values) => {
            try {
              await apiClient("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({
                  email: values.email,
                  token,
                  newPassword: values.password,
                  appType: "website",
                }),
              });
              toast.success("Password has been reset successfully.");
              router.push(ROUTES.signIn);
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Failed to reset password.");
            }
          })}
        >
          <Input 
            id="reset-email" 
            label="Confirm Email" 
            type="email"
            error={errors.email?.message} 
            {...register("email")}
            disabled={!!emailFromUrl}
            className={emailFromUrl ? "opacity-50 cursor-not-allowed" : ""}
          />

          <Input 
            id="reset-password" 
            label="New Password" 
            type="password" 
            error={errors.password?.message} 
            {...register("password")} 
          />
          <Input 
            id="reset-confirm-password" 
            label="Confirm New Password" 
            type="password" 
            error={errors.confirmPassword?.message} 
            {...register("confirmPassword")} 
          />
          
          <Button className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </section>
    </div>
  );
}
