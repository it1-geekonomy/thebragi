import { headers } from "next/headers";
import { Metadata } from "next";
import { getCrmLoginUrl } from "@/config/crm";
import { CheckoutSuccessClient } from "@/features/checkout/components/CheckoutSuccessClient";

export const metadata: Metadata = { title: "Checkout complete" };

export default async function CheckoutSuccessPage() {
  const host = (await headers()).get("host");
  const crmLoginUrl = getCrmLoginUrl(host);
  return <CheckoutSuccessClient crmLoginUrl={crmLoginUrl} />;
}
