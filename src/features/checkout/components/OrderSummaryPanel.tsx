"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import type { BillingCycle, PurchaseMode } from "@/features/checkout/lib/checkout-params";
import type { DynamicPlan } from "@/features/subscription/hooks/useSubscriptionPlans";
import { renewalDateLabel } from "@/features/checkout/lib/gst";
import { TRIAL_AUTHORIZATION_RUPEES } from "@/features/checkout/lib/order-math";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";

import type { SubscriptionQuote } from "@/features/subscription/api";

export function OrderSummaryPanel({
  plan,
  users,
  cycle,
  subtotal,
  total,
  onSeatsChange,
  onCycleChange,
  className,
  basePrice,
  perUserPrice,
  overageSeats,
  setupFee,
  minimumSeats,
  maximumSeats,
  purchaseMode,
  quote,
  loadingQuote,
}: {
  plan: DynamicPlan;
  users: number;
  cycle: BillingCycle;
  subtotal: number;
  total: number;
  onSeatsChange: (users: number) => void;
  onCycleChange: (cycle: BillingCycle) => void;
  className?: string;
  basePrice: number;
  perUserPrice: number;
  overageSeats: number;
  setupFee: number;
  minimumSeats: number;
  maximumSeats?: number;
  purchaseMode: PurchaseMode;
  quote?: SubscriptionQuote | null;
  loadingQuote?: boolean;
}) {
  const includedUsers = quote ? quote.includedSeats : (plan.includedUsers || plan.maxUsers);
  const isTrial = purchaseMode === "trial";
  const atMax = Boolean(maximumSeats && users >= maximumSeats);

  const displayBasePrice = quote ? quote.basePrice : basePrice;
  const displayExtraSeats = quote ? quote.extraSeats : overageSeats;
  const displayExtraCharge = quote ? quote.extraSeatCharge : (overageSeats * perUserPrice);
  const displaySetupFee = quote ? quote.setupCost : setupFee;
  const displayTaxable = quote ? quote.taxable : subtotal;
  const displayTotal = quote ? quote.totalAmount : total;

  return (
    <aside className={cn("rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:sticky lg:top-24", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Order summary</p>
        {loadingQuote && <span className="text-xs text-white/40 animate-pulse">Calculating...</span>}
      </div>

      <div className="mt-5 flex flex-col gap-2 border-b border-white/8 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-white">{plan.name} Base Package</p>
          <p className="mt-1 text-xs text-white/42">
            {includedUsers ? `Includes up to ${includedUsers} users` : `Starts at ${minimumSeats} users`}
          </p>
        </div>
        <p className="shrink-0 font-semibold text-white sm:text-right">
          {formatCurrency(displayBasePrice)} /{cycle === "annual" ? "yr" : "mo"}
        </p>
      </div>

      {isTrial ? null : (
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-white/58">Users</span>
        <div className="inline-flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 w-9 px-0"
            aria-label="Decrease users"
            onClick={() => onSeatsChange(Math.max(minimumSeats, users - 1))}
            disabled={users <= minimumSeats}
          >
            -
          </Button>
          <span className="min-w-8 text-center text-sm font-semibold text-white">{users}</span>
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 w-9 px-0"
            aria-label={atMax ? "Maximum users reached" : "Increase users"}
            onClick={() => onSeatsChange(users + 1)}
            disabled={atMax}
          >
            +
          </Button>
        </div>
      </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-white/58">Billing cycle</span>
        <div className="inline-flex rounded-md border border-white/12 p-0.5">
          {(["monthly", "annual"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onCycleChange(option)}
              className={
                cycle === option
                  ? "rounded bg-[#5f9965] px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded px-3 py-1.5 text-xs font-semibold text-white/55 hover:text-white"
              }
            >
              {option === "monthly" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-6 grid gap-3 border-t border-white/8 pt-5 text-sm">
        {isTrial ? (
          <div className="flex justify-between gap-3 text-base">
            <dt className="font-semibold text-white">Due today</dt>
            <dd className="font-semibold text-white">{formatCurrency(TRIAL_AUTHORIZATION_RUPEES)}</dd>
          </div>
        ) : (
          <>
            {includedUsers ? (
              <div className="flex justify-between gap-3 text-white/60">
                <dt>Included users</dt>
                <dd>{includedUsers}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3 text-white/60">
              <dt>Additional users</dt>
              <dd>
                {displayExtraSeats > 0
                  ? `${displayExtraSeats} x ${formatCurrency(displayExtraCharge / displayExtraSeats)}`
                  : "0"}
              </dd>
            </div>
            {displaySetupFee > 0 ? (
              <div className="flex justify-between gap-3 text-white/60">
                <dt>One-time setup fee</dt>
                <dd>{formatCurrency(displaySetupFee)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-white/48">Subtotal (Taxable)</dt>
              <dd className="text-white/84">{formatCurrency(displayTaxable)}</dd>
            </div>

            {quote && quote.taxAmount > 0 ? (
              <>
                {quote.cgst > 0 && quote.sgst > 0 ? (
                  <>
                    <div className="flex justify-between gap-3 text-white/60">
                      <dt>CGST (9%)</dt>
                      <dd>{formatCurrency(quote.cgst)}</dd>
                    </div>
                    <div className="flex justify-between gap-3 text-white/60">
                      <dt>SGST (9%)</dt>
                      <dd>{formatCurrency(quote.sgst)}</dd>
                    </div>
                  </>
                ) : quote.igst > 0 ? (
                  <div className="flex justify-between gap-3 text-white/60">
                    <dt>IGST (18%)</dt>
                    <dd>{formatCurrency(quote.igst)}</dd>
                  </div>
                ) : (
                  <div className="flex justify-between gap-3 text-white/60">
                    <dt>GST (18%)</dt>
                    <dd>{formatCurrency(quote.taxAmount)}</dd>
                  </div>
                )}
              </>
            ) : null}

            <div className="flex justify-between gap-3 border-t border-white/8 pt-3 text-base">
              <dt className="font-semibold text-white">Total</dt>
              <dd className="font-semibold text-white">{formatCurrency(displayTotal)}</dd>
            </div>
          </>
        )}
      </dl>

      <p className="mt-4 text-xs leading-5 text-white/38">
        {isTrial
          ? `The selected plan stays attached to the trial, but Razorpay authorizes only ${formatCurrency(TRIAL_AUTHORIZATION_RUPEES)} today.`
          : `All taxes and extra user charges included in total.`}{" "}
        Renews {renewalDateLabel(cycle)}.
      </p>

      <Link className="mt-5 inline-flex text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>
        Change plan
      </Link>
    </aside>
  );
}
