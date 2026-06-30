import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, type ProductKey } from "@/config/products";
import { ROUTES } from "@/config/routes";
import { MarketingLayout } from "@/shared/layouts/MarketingLayout";
import { CTAButton } from "@/shared/components/marketing/CTAButton";
import { CheckoutCTAButton } from "@/shared/components/marketing/CheckoutCTAButton";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/ui/EmptyState";

const pages = {
  sales: products.sales,
  projects: products.projects,
  full: products.full,
};

const pageDetails = {
  sales: {
    label: "Sales workspace",
    proof: "For teams that need pipeline clarity before they need sales ops complexity.",
    workflow: [
      ["Lead captured", "Source, owner, company, and next action land in one view."],
      ["Deal qualified", "Move opportunities through stages without losing notes."],
      ["Follow-up focused", "Keep upcoming actions visible so good leads do not go cold."],
    ],
    previewColumns: ["New", "Qualified", "Proposal"],
    previewItems: ["Acme onboarding", "Northstar CRM", "Orbit retainer", "Kite redesign"],
    useCases: ["Founder-led sales", "Simple deal reviews", "Pipeline cleanup", "Weekly revenue rhythm"],
  },
  projects: {
    label: "Project workspace",
    proof: "For delivery teams that need task ownership and status without another status meeting.",
    workflow: [
      ["Scope created", "Turn sold work into a visible project with clear owners."],
      ["Tasks assigned", "Track what is active, blocked, and ready for review."],
      ["Delivery reported", "Give founders and clients a crisp view of progress."],
    ],
    previewColumns: ["Planned", "In progress", "Review"],
    previewItems: ["Kickoff notes", "Design pass", "Data import", "Launch QA"],
    useCases: ["Client delivery", "Task ownership", "Project reviews", "Founder visibility"],
  },
  full: {
    label: "Unified workspace",
    proof: "For teams that want the whole flow visible from first conversation to finished work.",
    workflow: [
      ["Sell", "Track the opportunity and the promise being made."],
      ["Handoff", "Move won work into delivery with context intact."],
      ["Operate", "See revenue motion, project load, and open work together."],
    ],
    previewColumns: ["Pipeline", "Handoff", "Delivery"],
    previewItems: ["Lead won", "Scope ready", "Build active", "Launch done"],
    useCases: ["Unified dashboard", "Sales to delivery", "Leadership reviews", "Operating rhythm"],
  },
} satisfies Record<ProductKey, {
  label: string;
  proof: string;
  workflow: string[][];
  previewColumns: string[];
  previewItems: string[];
  useCases: string[];
}>;

export function generateMetadata({ params }: { params: { product: ProductKey } }): Metadata {
  const product = pages[params.product];
  return {
    title: product?.title ?? "Product",
    description: product?.description,
  };
}

function ProductPreview({ productKey }: { productKey: ProductKey }) {
  const detail = pageDetails[productKey];
  const columns = detail.previewColumns.map((column, columnIndex) => ({
    column,
    items: detail.previewItems.filter((_, itemIndex) => itemIndex % detail.previewColumns.length === columnIndex),
  }));

  return (
    <div className="rounded-lg border border-white/10 bg-[#070d08] p-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7dc890]">Preview</p>
          <p className="mt-1 text-sm text-white/52">Frontend mockup</p>
        </div>
        <span className="rounded-full border border-[#7dc890]/30 bg-[#7dc890]/10 px-3 py-1 text-xs font-semibold text-[#c8f0d0]">Live flow</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {columns.map(({ column, items }) => (
          <div key={column} className="rounded-md border border-white/10 bg-black/45 p-3">
            <h3 className="text-sm font-semibold text-white">{column}</h3>
            <div className="mt-3 grid gap-2">
              {items.map((item) => <div key={item} className="rounded border border-white/10 bg-white/[0.045] p-3 text-xs leading-5 text-white/68">{item}</div>)}
              {items.length === 0 ? <div className="rounded border border-dashed border-white/10 p-3 text-xs text-white/34">Ready</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductPage({ productKey }: { productKey: ProductKey }) {
  const product = pages[productKey];
  const detail = pageDetails[productKey];
  if (!product) notFound();

  return (
    <MarketingLayout>
      <main className="bg-black text-white">
        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <Badge>{detail.label}</Badge>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">{product.audience}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">{product.heroHeadline}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">{product.description}</p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/44">{detail.proof}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <CheckoutCTAButton checkoutPlan={product.checkoutPlan} />
                <CTAButton href={ROUTES.pricing} variant="secondary">Compare plans</CTAButton>
              </div>
            </div>
            <div className="grid gap-5">
              <div className="relative aspect-[16/8] rounded-lg border border-white/10 bg-white/[0.04]">
                <Image src={product.image} alt="" fill className="object-contain p-10" />
              </div>
              <ProductPreview productKey={productKey} />
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#050705] px-5 py-16 sm:px-8 lg:px-10">
          <SectionHeading eyebrow="How it works" title={`${product.title} keeps the next move obvious`}>
            A focused path for the part of the business this plan is meant to improve first.
          </SectionHeading>
          <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-3">
            {detail.workflow.map(([title, body], index) => (
              <Card key={title} className="p-6">
                <span className="text-sm font-semibold text-[#7dc890]">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Included</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">The core pieces your team expects are already framed.</h2>
              <p className="mt-4 text-sm leading-6 text-white/56">These are frontend-ready feature surfaces. Backend wiring can plug into the same components later.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.features.map((feature) => <Card key={feature} className="p-5 text-white/78">{feature}</Card>)}
              {detail.useCases.map((useCase) => <Card key={useCase} className="p-5 text-white/58">{useCase}</Card>)}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <EmptyState
              title={`Ready to try ${product.title}?`}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <CheckoutCTAButton checkoutPlan={product.checkoutPlan} />
                  <Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/8" href="/#waitlist">Join waitlist</Link>
                </div>
              }
            >
              Choose a plan now, or join early access while the frontend flow is being completed.
            </EmptyState>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
}
