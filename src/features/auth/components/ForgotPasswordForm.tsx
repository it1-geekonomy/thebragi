"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { apiClient } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { BackButton } from "@/shared/components/ui/BackButton";
import { useAppSelector } from "@/store/hooks";

const forgotPasswordSchema = yup.object({
  email: yup.string().email("Enter a valid email.").required("Email is required."),
});

type ForgotPasswordValues = yup.InferType<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { userEmail, isAuthenticated } = useAppSelector((state) => state.session);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: userEmail || "" },
  });

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <BackButton />
      </div>
      <section className="rounded-lg border border-white/10 bg-[#0b100c] p-6 sm:p-8">
        <BragiLogo />
        <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Reset password</h1>
        <p className="mt-3 text-sm text-white/58 mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <form
          className="grid gap-5"
          onSubmit={handleSubmit(async (values) => {
            try {
              const resetUrl = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
              await apiClient("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({
                  email: values.email,
                  appType: "website",
                  resetUrl,
                  redirectUrl: resetUrl,
                }),
              });
              toast.success("If an account exists, a reset link has been sent to your email.");
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Failed to send reset link.");
            }
          })}
        >
          <Input 
            id="forgot-email" 
            label="Email" 
            type="email" 
            autoComplete="email" 
            error={errors.email?.message} 
            readOnly={isAuthenticated}
            className={isAuthenticated ? "opacity-70 pointer-events-none" : ""}
            {...register("email")} 
          />
          
          <Button className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Sending link..." : "Send reset link"}
          </Button>
        </form>
      </section>
    </div>
  );
}
