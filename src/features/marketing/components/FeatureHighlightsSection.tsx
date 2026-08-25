import { Card } from "@/shared/components/ui/Card";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";

const highlights = [
  ["Sales context follows the work", "Keep lead notes, deal status, and customer promises close to the project that follows."],
  ["Delivery stays visible", "See what is active, blocked, and ready without asking every team member for a status update."],
  ["Founders get one operating view", "Track pipeline and project load together before the next handoff becomes a surprise."],
  ["Designed for small teams", "Enough structure to run the company, without the heavyweight CRM ceremony."],
];

export function FeatureHighlightsSection() {
  return (
    <section className="bg-[#050705] px-5 py-16 sm:px-8 lg:px-10">
      <SectionHeading eyebrow="Workflow" title="The work between selling and delivering finally has a home">
        Bragi is built around the messy middle where deals become promises and promises become projects.
      </SectionHeading>
      <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-2">
        {highlights.map(([title, body]) => (
          <Card key={title} className="p-6">
            <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">{body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
