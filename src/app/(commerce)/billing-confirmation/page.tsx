import { Metadata } from "next";
import { BillingConfirmationClient } from "@/features/auth/components/BillingConfirmationClient";

export const metadata: Metadata = {
  title: "Trial confirmation",
  description: "Review your Bragi trial plan, dates, and pricing before opening the app.",
};

export default function BillingConfirmationPage() {
  return <BillingConfirmationClient />;
}
