import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Button } from "@/shared/components/ui/Button";

const members = [["Preview user", "Owner"], ["Sales lead", "Sales"], ["Delivery lead", "Projects"]];

export default function SettingsPage() {
  return (
    <main className="px-5 py-8 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Settings</p><h1 className="mt-3 text-3xl font-semibold text-white">Workspace settings</h1><p className="mt-2 text-sm text-white/52">Frontend organization settings prepared for team and module management.</p>
      <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <Card className="grid gap-5 p-6"><h2 className="text-xl font-semibold">Organization</h2><Input id="org" label="Organization name" defaultValue="Preview company" /><label className="text-sm text-white/72"><span className="mb-2 block font-medium">Default module</span><Select defaultValue="full"><option value="sales">Sales</option><option value="projects">Projects</option><option value="full">Full workspace</option></Select></label><Button type="button">Save settings</Button></Card>
        <Card className="p-6"><h2 className="text-xl font-semibold">Team</h2><div className="mt-5 grid gap-3">{members.map(([name, role]) => <div key={name} className="flex items-center justify-between rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm"><span className="text-white/76">{name}</span><span className="text-white/42">{role}</span></div>)}</div><Button className="mt-5" type="button" variant="secondary">Invite teammate</Button></Card>
      </section>
    </main>
  );
}
