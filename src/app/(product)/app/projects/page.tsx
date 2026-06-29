import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";

const columns = [
  { title: "Planned", tasks: ["Kickoff notes", "Scope approval"] },
  { title: "In progress", tasks: ["Data import", "Design pass"] },
  { title: "Review", tasks: ["Launch QA", "Client summary"] },
];
const timeline = [["Acme onboarding", "On track", "Jun 28"], ["Kite redesign", "At risk", "Jul 02"], ["Orbit retainer", "Review", "Jul 08"]];

export default function ProjectsIndexPage() {
  return (
    <main className="px-5 py-8 sm:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Projects</p><h1 className="mt-3 text-3xl font-semibold text-white">Delivery board preview</h1><p className="mt-2 text-sm text-white/52">Frontend project module shell for tasks, delivery, and calendar views.</p></div><Badge>Projects module</Badge></div>
      <section className="mt-8 grid gap-5 lg:grid-cols-3">{columns.map((column) => <Card key={column.title} className="p-4"><h2 className="font-semibold text-white">{column.title}</h2><div className="mt-4 grid gap-3">{column.tasks.map((task) => <div key={task} className="rounded-md border border-white/10 bg-black/35 p-3"><p className="text-sm font-semibold text-white/78">{task}</p><p className="mt-1 text-xs text-white/38">Owner assigned</p></div>)}</div></Card>)}</section>
      <Card className="mt-8 p-6"><h2 className="text-xl font-semibold">Delivery timeline</h2><div className="mt-5 grid gap-3">{timeline.map(([project, status, date]) => <div key={project} className="grid gap-2 rounded-md border border-white/10 bg-black/35 p-3 text-sm sm:grid-cols-[1fr_auto_auto]"><span className="font-semibold text-white/80">{project}</span><span className={status === "At risk" ? "text-red-300" : "text-[#a8dfb3]"}>{status}</span><span className="text-white/42">{date}</span></div>)}</div></Card>
    </main>
  );
}
