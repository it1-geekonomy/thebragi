"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import type { Plan } from "@/config/plans";
import type { BillingCycle } from "@/features/checkout/lib/checkout-params";
import { MIN_SEATS } from "@/features/checkout/lib/checkout-params";
import { SAC_CODE, renewalDateLabel, type TaxBreakdown } from "@/features/checkout/lib/gst";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";

export function OrderSummaryPanel({
  plan,
  seats,
  cycle,
  subtotal,
  tax,
  total,
  onSeatsChange,
  onCycleChange,
  className,
}: {
  plan: Plan;
  seats: number;
  cycle: BillingCycle;
  subtotal: number;
  tax: TaxBreakdown;
  total: number;
  onSeatsChange: (seats: number) => void;
  onCycleChange: (cycle: BillingCycle) => void;
  className?: string;
}) {
  return (
    <aside className={cn("rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:sticky lg:top-24", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Order summary</p>

      <div className="mt-5 flex items-center justify-between gap-3 border-b border-white/8 pb-4">
        <div>
          <p className="font-semibold text-white">{plan.name}</p>
          <p className="mt-1 text-xs text-white/42">per user / month</p>
        </div>
        <p className="font-semibold text-white">
          {formatCurrency(cycle === "annual" ? Math.round(plan.priceMonthly * 0.8) : plan.priceMonthly)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm text-white/58">Seats</span>
        <div className="inline-flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 w-9 px-0"
            aria-label="Decrease seats"
            onClick={() => onSeatsChange(Math.max(MIN_SEATS, seats - 1))}
            disabled={seats <= MIN_SEATS}
          >
            –
          </Button>
          <span className="min-w-8 text-center text-sm font-semibold text-white">{seats}</span>
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 w-9 px-0"
            aria-label="Increase seats"
            onClick={() => onSeatsChange(seats + 1)}
          >
            +
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm text-white/58">Billing cycle</span>
        <div className="inline-flex rounded-md border border-white/12 p-0.5">
          {(["monthly", "annual"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onCycleChange(option)}
              className={
                cycle === option
                  ? "rounded px-3 py-1.5 text-xs font-semibold bg-[#5f9965] text-white"
                  : "rounded px-3 py-1.5 text-xs font-semibold text-white/55 hover:text-white"
              }
            >
              {option === "monthly" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-6 grid gap-3 border-t border-white/8 pt-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-white/48">Subtotal</dt>
          <dd className="text-white/84">{formatCurrency(subtotal)}</dd>
        </div>
        {tax.kind === "intra" ? (
          <>
            <div className="flex justify-between gap-3">
              <dt className="text-white/48">CGST @ 9%</dt>
              <dd className="text-white/84">{formatCurrency(tax.cgst)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/48">SGST @ 9%</dt>
              <dd className="text-white/84">{formatCurrency(tax.sgst)}</dd>
            </div>
          </>
        ) : (
          <div className="flex justify-between gap-3">
            <dt className="text-white/48">IGST @ 18%</dt>
            <dd className="text-white/84">{formatCurrency(tax.igst)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3 border-t border-white/8 pt-3 text-base">
          <dt className="font-semibold text-white">Total</dt>
          <dd className="font-semibold text-white">{formatCurrency(total)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs leading-5 text-white/38">
        {tax.kind === "intra" ? "Intra-state supply — CGST + SGST applied." : "Inter-state supply — IGST applied."}{" "}
        SAC {SAC_CODE} · Renews {renewalDateLabel(cycle)}.
      </p>

      <Link className="mt-5 inline-flex text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>
        Change plan
      </Link>
    </aside>
  );
}
