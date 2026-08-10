import { Metadata } from "next";
import { ProfilePageClient } from "@/features/account/components/ProfilePageClient";

export const metadata: Metadata = { title: "Account Profile" };

export default function AccountProfilePage() {
  return <ProfilePageClient />;
}
