"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

const schema = yup.object({ password: yup.string().min(10, "Use at least 10 characters.").required("Password is required.") });
type FormValues = yup.InferType<typeof schema>;

export function SetPasswordForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: yupResolver(schema) });
  return (
    <form className="grid gap-5" onSubmit={handleSubmit(async () => undefined)}>
      <Input id="password" label="Create password" type="password" error={errors.password?.message} {...register("password")} />
      <Button disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Continue to Bragi"}</Button>
    </form>
  );
}
