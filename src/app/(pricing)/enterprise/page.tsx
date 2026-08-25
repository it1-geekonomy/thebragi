import { Metadata } from "next";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";
import { Button } from "@/shared/components/ui/Button";

export const metadata: Metadata = {
  title: "Enterprise Plan | Bragi",
  description: "Custom built for large scale organizations",
};

export default function EnterprisePage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <section className="px-5 py-24 sm:px-8 lg:px-10 flex flex-col items-center justify-center text-center">
        <BragiLogo />
        <h1 className="mt-12 text-4xl font-semibold leading-tight sm:text-5xl">
          Bragi Enterprise
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
          Tailored solutions for large-scale organizations. Get dedicated support, custom integrations, volume discounts, and enterprise-grade security.
        </p>
        
        <div className="mt-12 flex flex-col items-center justify-center gap-6">
          <p className="text-white/80 font-medium text-lg">Ready to scale your business?</p>
          <a href="mailto:connect@thegeekonomy.com">
            <Button>Contact: connect@thegeekonomy.com</Button>
          </a>
        </div>
      </section>
    </main>
  );
}
