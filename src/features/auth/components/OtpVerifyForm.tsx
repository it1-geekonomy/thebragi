"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Alert } from "@/shared/components/ui/Alert";

const schema = yup.object({ code: yup.string().length(6, "Enter the 6 digit code.").required("Code is required.") });
type FormValues = yup.InferType<typeof schema>;

export function OtpVerifyForm() {
  const [cooldown, setCooldown] = useState(24);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: yupResolver(schema) });

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(async () => toast.success("OTP verified for this frontend preview."))}>
      <Alert tone="info">Use any 6 digit code. The resend timer is frontend-only for now.</Alert>
      <Input id="code" label="Verification code" inputMode="numeric" maxLength={6} error={errors.code?.message} {...register("code")} />
      <div className="flex flex-wrap gap-3">
        <Button disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify code"}</Button>
        <Button type="button" variant="secondary" disabled={cooldown > 0} onClick={() => {
          setCooldown(24);
          toast.info("Mock code resent.");
        }}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}</Button>
      </div>
      <button type="button" className="text-left text-xs text-white/38" onClick={() => setCooldown((value) => Math.max(0, value - 6))}>Preview: reduce timer</button>
    </form>
  );
}
