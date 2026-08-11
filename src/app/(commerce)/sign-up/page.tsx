import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; returnTo?: string; purchaseMode?: string; cycle?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ mode: "signup" });
  if (params.plan) query.set("plan", params.plan);
  if (params.returnTo) query.set("returnTo", params.returnTo);
  query.set("purchaseMode", params.purchaseMode === "buy_now" ? "buy_now" : "trial");
  if (params.cycle === "monthly" || params.cycle === "annual") query.set("cycle", params.cycle);
  redirect(`${ROUTES.signIn}?${query.toString()}`);
}
