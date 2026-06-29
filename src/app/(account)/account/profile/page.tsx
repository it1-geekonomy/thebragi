import { Metadata } from "next";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { Badge } from "@/shared/components/ui/Badge";

export const metadata: Metadata = { title: "Account Profile" };

const details = [
  ["Session", "Frontend preview"],
  ["Role", "Workspace owner"],
  ["Plan", "Bragi Full"],
];

export default function AccountProfilePage() {
  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Account</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Profile</h1>
          <p className="mt-2 text-sm text-white/52">Mock profile details prepared for API-backed account management.</p>
        </div>
        <Badge>Owner</Badge>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="grid gap-5 p-6">
          <h2 className="text-xl font-semibold text-white">Personal and company details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input id="name" label="Name" defaultValue="Preview user" />
            <Input id="email" label="Email" type="email" defaultValue="founder@company.com" />
            <Input id="company" label="Company" defaultValue="Preview company" />
            <label className="text-sm text-white/72">
              <span className="mb-2 block font-medium">Team size</span>
              <Select defaultValue="6-20"><option>1-5</option><option>6-20</option><option>21-50</option><option>51+</option></Select>
            </label>
          </div>
          <div className="flex flex-wrap gap-3"><Button type="button">Save changes</Button><Button type="button" variant="secondary">Reset preview</Button></div>
        </Card>
        <div className="grid gap-5">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white">Account status</h2>
            <div className="mt-5 grid gap-3">
              {details.map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm"><span className="text-white/44">{label}</span><span className="font-semibold text-white/78">{value}</span></div>)}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white">Security</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">Password, OTP, and session settings will connect here when auth APIs are ready.</p>
            <Button className="mt-5" type="button" variant="secondary">Manage sign-in</Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
