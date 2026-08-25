import { Metadata } from "next";
import { MarketingLayout } from "@/shared/layouts/MarketingLayout";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <MarketingLayout>
      <main className="px-5 py-16 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="Contact" title="Talk to Bragi">
          For early access plan questions or migration help, send the team a note.
        </SectionHeading>
        <form className="mx-auto mt-10 grid max-w-2xl gap-5 rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <Input id="name" label="Name" placeholder="Your name" />
          <Input id="email" label="Email" type="email" placeholder="you@company.com" />
          <label className="text-sm text-white/72">
            <span className="mb-2 block font-medium">Message</span>
            <textarea className="min-h-32 w-full rounded-md border border-white/12 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#7dc890]" placeholder="How can we help?" />
          </label>
          <Button type="button">Send message</Button>
          <p className="text-sm text-white/46">Or email <a className="text-[#a8dfb3]" href={`mailto:${brand.email}`}>{brand.email}</a>.</p>
        </form>
      </main>
    </MarketingLayout>
  );
}
