import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/config/routes";
import { formatCurrency } from "@/shared/lib/format-currency";

export const metadata: Metadata = { title: "Account Billing" };

const invoices = [
  ["INV-1003", "Bragi Full", "Jun 2026", 3999, "Paid"],
  ["INV-1002", "Bragi Full", "May 2026", 3999, "Paid"],
  ["INV-1001", "Bragi Full", "Apr 2026", 3999, "Paid"],
];

const modules = ["Sales pipeline", "Project management", "Unified dashboard", "Email support"];

export default function AccountBillingPage() {
  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Account</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Billing</h1>
          <p className="mt-2 text-sm text-white/52">Frontend billing portal preview with mock subscription and invoice states.</p>
        </div>
        <Link className="text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>Compare plans</Link>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Current plan</h2><Badge>Active</Badge></div>
          <p className="mt-4 text-3xl font-semibold text-white">Bragi Full</p>
          <p className="mt-2 text-sm text-white/52">{formatCurrency(3999)} / month. Renewal preview: July 26, 2026.</p>
          <div className="mt-6 grid gap-3">
            {modules.map((module) => <div key={module} className="rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm text-white/68">+ {module}</div>)}
          </div>
          <div className="mt-6 flex flex-wrap gap-3"><Button type="button">Update payment method</Button><Button type="button" variant="secondary">Cancel preview</Button></div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Invoice history</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-white/42"><tr><th className="py-2">Invoice</th><th>Plan</th><th>Period</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody className="divide-y divide-white/10 text-white/68">
                {invoices.map(([id, plan, period, amount, status]) => <tr key={id}><td className="py-3 font-semibold text-white/80">{id}</td><td>{plan}</td><td>{period}</td><td>{formatCurrency(Number(amount))}</td><td className="text-[#a8dfb3]">{status}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
