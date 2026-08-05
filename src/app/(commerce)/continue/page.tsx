import { Metadata } from "next";
import { ContinueClient } from "@/features/auth/components/ContinueClient";

export const metadata: Metadata = {
  title: "Continue to Bragi",
  description: "Open your Bragi workspace when you're ready.",
};

export default function ContinuePage() {
  return <ContinueClient />;
}
