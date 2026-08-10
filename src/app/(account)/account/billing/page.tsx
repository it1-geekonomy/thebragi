import { Metadata } from "next";
import { BillingPageClient } from "@/features/account/components/BillingPageClient";

export const metadata: Metadata = { title: "Account Billing" };

export default function AccountBillingPage() {
  return <BillingPageClient />;
}
