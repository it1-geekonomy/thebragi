import { Metadata } from "next";
import { WebsiteDashboardClient } from "@/features/auth/components/WebsiteDashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | Bragi",
  description: "Manage your Bragi workspace.",
};

export default function DashboardPage() {
  return <WebsiteDashboardClient />;
}
