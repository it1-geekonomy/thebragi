import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ mode: "signup" });
  if (params.plan) query.set("plan", params.plan);
  if (params.returnTo) query.set("returnTo", params.returnTo);
  redirect(`${ROUTES.signIn}?${query.toString()}`);
}
