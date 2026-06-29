import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = { title: "Dashboard" };

const metrics = [["Pipeline", "12 active deals", "+18% this month"], ["Projects", "7 in delivery", "3 at risk"], ["Tasks", "18 due this week", "6 due today"], ["Revenue", "?8.4L open", "?2.1L closing"]];
const activity = ["Orbit retainer moved to Proposal", "Kite redesign kicked off", "Northstar CRM task overdue", "Acme onboarding marked in review"];

export default function DashboardPage() {
  return (
    <main className="px-5 py-8 sm:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Dashboard</p><h1 className="mt-3 text-3xl font-semibold text-white">Founder operating view</h1><p className="mt-2 text-sm text-white/52">A frontend preview of the CRM dashboard before module migration.</p></div>
        <Link className="rounded-md bg-[#5f9965] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6bad72]" href={ROUTES.onboarding}>Open onboarding</Link>
      </div>
      <section className="mt-8 grid gap-5 xl:grid-cols-4">
        {metrics.map(([title, value, detail]) => <Card key={title} className="p-6"><h2 className="text-sm text-white/50">{title}</h2><p className="mt-3 text-2xl font-semibold text-white">{value}</p><p className="mt-2 text-xs text-[#a8dfb3]">{detail}</p></Card>)}
      </section>
      <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Workload preview</h2><Badge>Mock data</Badge></div><div className="mt-6 grid gap-4">{[["Sales", "72%"], ["Projects", "58%"], ["Tasks due", "41%"]].map(([label, width]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><span className="text-white/62">{label}</span><span className="text-white/42">{width}</span></div><div className="h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-[#5f9965]" style={{ width }} /></div></div>)}</div></Card>
        <Card className="p-6"><h2 className="text-xl font-semibold">Recent activity</h2><div className="mt-5 grid gap-3">{activity.map((item) => <div key={item} className="rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm text-white/64">{item}</div>)}</div></Card>
      </section>
    </main>
  );
}
