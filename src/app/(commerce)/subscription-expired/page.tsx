import { Metadata } from "next";
import { SubscriptionExpiredClient } from "@/features/auth/components/SubscriptionExpiredClient";

export const metadata: Metadata = {
  title: "Subscription expired",
  description: "Upgrade your Bragi plan to continue using your workspace.",
};

export default function SubscriptionExpiredPage() {
  return <SubscriptionExpiredClient />;
}
