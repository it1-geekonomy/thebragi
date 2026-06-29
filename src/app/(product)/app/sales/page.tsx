import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";

const columns = [
  { title: "New", deals: ["Acme onboarding", "Kite redesign"] },
  { title: "Qualified", deals: ["Northstar CRM", "Orbit retainer"] },
  { title: "Proposal", deals: ["Atlas migration"] },
];
const leads = [["Acme", "?1.2L", "Today"], ["Northstar", "?3.8L", "Tomorrow"], ["Orbit", "?2.4L", "Friday"]];

export default function SalesIndexPage() {
  return (
    <main className="px-5 py-8 sm:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Sales</p><h1 className="mt-3 text-3xl font-semibold text-white">Pipeline preview</h1><p className="mt-2 text-sm text-white/52">Frontend sales module shell for CRM migration.</p></div><Badge>Sales module</Badge></div>
      <section className="mt-8 grid gap-5 lg:grid-cols-3">{columns.map((column) => <Card key={column.title} className="p-4"><h2 className="font-semibold text-white">{column.title}</h2><div className="mt-4 grid gap-3">{column.deals.map((deal) => <div key={deal} className="rounded-md border border-white/10 bg-black/35 p-3"><p className="text-sm font-semibold text-white/78">{deal}</p><p className="mt-1 text-xs text-white/38">Next action queued</p></div>)}</div></Card>)}</section>
      <Card className="mt-8 p-6"><h2 className="text-xl font-semibold">Lead table</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[460px] text-left text-sm"><thead className="text-white/42"><tr><th className="py-2">Lead</th><th>Value</th><th>Next action</th></tr></thead><tbody className="divide-y divide-white/10 text-white/68">{leads.map(([lead, value, next]) => <tr key={lead}><td className="py-3 font-semibold text-white/80">{lead}</td><td>{value}</td><td>{next}</td></tr>)}</tbody></table></div></Card>
    </main>
  );
}
