import { Metadata } from "next";
import { Suspense } from "react";
import { SelectOrganizationClient } from "@/features/auth/components/SelectOrganizationClient";

export const metadata: Metadata = {
  title: "Select Organization | Bragi",
  description: "Select your organization workspace to access your Bragi CRM account.",
};

export default function SelectOrganizationPage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:px-8 lg:py-16">
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
          </div>
        }
      >
        <SelectOrganizationClient />
      </Suspense>
    </main>
  );
}
