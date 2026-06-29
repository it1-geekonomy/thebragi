import { Metadata } from "next";
import Link from "next/link";
import { products } from "@/config/products";
import { ROUTES } from "@/config/routes";
import { MarketingLayout } from "@/shared/layouts/MarketingLayout";
import { ProductPod } from "@/shared/components/marketing/ProductPod";
import { CTAButton } from "@/shared/components/marketing/CTAButton";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore Bragi features for sales pipelines, project delivery, handoffs, dashboards, and founder visibility.",
};

const operatingFeatures = [
  {
    title: "Pipeline That Stays Honest",
    eyebrow: "Sales",
    body: "Track leads, deal stages, next actions, and revenue motion without turning a lean team into a reporting department.",
    points: ["Deal stages", "Follow-up focus", "Revenue snapshots"],
  },
  {
    title: "Projects That Keep The Promise",
    eyebrow: "Delivery",
    body: "Move from sold work into delivery with owners, status, tasks, and the original customer context still visible.",
    points: ["Task ownership", "Delivery status", "Client-ready summaries"],
  },
  {
    title: "One View Across The Handoff",
    eyebrow: "Operations",
    body: "Bragi joins the space between sales and delivery, so founders see the commitments being made and the work already in motion.",
    points: ["Unified dashboard", "Cross-team handoffs", "Module-aware plans"],
  },
];

const workflow = [
  ["Capture", "Lead arrives with company, source, value, and next action."],
  ["Close", "Deal moves through the pipeline with notes and owner context."],
  ["Handoff", "Won work becomes delivery scope without disappearing into another tool."],
  ["Deliver", "Projects, tasks, and status stay visible until completion."],
];

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <main className="bg-black text-white">
        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <Badge>Frontend preview</Badge>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Features</p>
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">A calmer way to run sales, delivery, and the handoff between them.</h1>
              </div>
              <p className="text-base leading-8 text-white/60 sm:text-lg">Bragi is built for founder-led teams that need enough operating structure to move fast, without splitting customer work across a stack of disconnected tools.</p>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
            {operatingFeatures.map((feature) => (
              <Card key={feature.title} className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7dc890]">{feature.eyebrow}</p>
                <h2 className="mt-4 text-2xl font-semibold">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/60">{feature.body}</p>
                <ul className="mt-6 grid gap-3 text-sm text-white/72">
                  {feature.points.map((point) => <li key={point} className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">{point}</li>)}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#050705] px-5 py-16 sm:px-8 lg:px-10">
          <SectionHeading eyebrow="Workflow" title="From first lead to finished work">
            Bragi maps the simple operating path most small teams already follow, then keeps it visible in one place.
          </SectionHeading>
          <div className="mx-auto mt-10 grid max-w-7xl gap-4 md:grid-cols-4">
            {workflow.map(([title, body], index) => (
              <div key={title} className="relative rounded-lg border border-white/10 bg-black/50 p-5">
                <span className="text-sm font-semibold text-[#7dc890]">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/56">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <SectionHeading eyebrow="Products" title="Choose the part of Bragi you need first">
            Each product page explains a focused path. Full brings both modules together for one operating view.
          </SectionHeading>
          <div className="mx-auto mt-10 grid max-w-7xl gap-5 md:grid-cols-3">
            {Object.values(products).map((product) => <ProductPod key={product.key} product={product} />)}
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-lg border border-[#7dc890]/20 bg-[#7dc890]/10 p-8 text-center md:flex-row md:text-left">
            <div>
              <h2 className="text-2xl font-semibold">Ready to map your operating flow?</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">Compare plans, then start from the module that solves the loudest problem today.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <CTAButton href={ROUTES.pricing}>Compare plans</CTAButton>
              <Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/8" href="/#waitlist">Join waitlist</Link>
            </div>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
}
