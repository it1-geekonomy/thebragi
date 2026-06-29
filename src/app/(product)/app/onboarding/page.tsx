import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { StepIndicator } from "@/shared/components/ui/StepIndicator";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = { title: "Onboarding" };

const steps = [
  ["Workspace", "Confirm company details and the team size Bragi should expect."],
  ["Modules", "Choose whether Sales, Projects, or both should be surfaced first."],
  ["Tour", "Preview the dashboard, module navigation, and account billing links."],
];

export default function OnboardingPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Welcome</p>
      <h1 className="mt-4 text-4xl font-semibold text-white">Set up your Bragi workspace</h1>
      <p className="mt-4 max-w-2xl text-white/58">A frontend onboarding shell for post-checkout users. Backend provisioning can later decide which step the user resumes from.</p>
      <div className="mt-8"><StepIndicator steps={["Welcome", "Org", "Modules", "Done"]} active={1} /></div>
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {steps.map(([title, body], index) => <Card key={title} className="p-6"><span className="text-sm font-semibold text-[#7dc890]">0{index + 1}</span><h2 className="mt-4 text-xl font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-white/58">{body}</p></Card>)}
      </section>
      <div className="mt-8 flex flex-wrap gap-3"><Button type="button">Start setup</Button><Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/8" href={ROUTES.dashboard}>Skip to dashboard</Link></div>
    </main>
  );
}
