import { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = { title: "Payment Cancelled" };

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; seats?: string; cycle?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const plan = params.plan || "bragi-full";
  const checkoutHref = ROUTES.checkout(plan, {
    seats: params.seats ? Number(params.seats) : undefined,
    cycle: params.cycle === "monthly" ? "monthly" : params.cycle === "annual" ? "annual" : undefined,
    mode: params.mode === "trial" ? "trial" : "buy_now",
  });

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7dc890]">Checkout paused</p>
      <h1 className="mt-5 text-4xl font-semibold text-white sm:text-5xl">Payment cancelled</h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-white/58">
        No payment was captured. Return to checkout with your plan selection, or pick a different plan.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="rounded-md bg-[#5f9965] px-5 py-3 text-sm font-semibold text-white" href={checkoutHref}>
          Return to checkout
        </Link>
        <Link
          className="rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/8"
          href={ROUTES.pricing}
        >
          View plans
        </Link>
      </div>
    </main>
  );
}
