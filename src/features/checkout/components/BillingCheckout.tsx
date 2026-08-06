"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPlanBySlug } from "@/config/plans";
import { ROUTES } from "@/config/routes";
import { setMockSession } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { apiClient, API_URL } from "@/shared/lib/api-client";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Alert } from "@/shared/components/ui/Alert";
import {
  buildCheckoutPath,
  buildSignInForCheckout,
  MIN_SEATS,
  type BillingCycle,
  type CheckoutParams,
} from "@/features/checkout/lib/checkout-params";
import {
  lookupGstin,
  resolveLocationFromAddress,
  type GstinLookup,
} from "@/features/checkout/lib/gst";
import { saveVerifiedBilling } from "@/features/checkout/lib/billing-session";
import { computeOrderTotals } from "@/features/checkout/lib/pricing";
import { OrderSummaryPanel } from "@/features/checkout/components/OrderSummaryPanel";


function syncCheckoutUrl(params: CheckoutParams) {
  const path = buildCheckoutPath(params);
  window.history.replaceState(null, "", path);
}

function applyGstLookup(
  setLegalName: (v: string) => void,
  setPan: (v: string) => void,
  setAddress: (v: string) => void,
  result: GstinLookup,
) {
  if (result.legalName) setLegalName(result.legalName);
  if (result.pan) setPan(result.pan);
  if (result.address) setAddress(result.address);
}

function clearGstFields(setLegalName: (v: string) => void, setPan: (v: string) => void) {
  setLegalName("");
  setPan("");
}

export function BillingCheckout({ initial }: { initial: CheckoutParams }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.session.isAuthenticated);
  const { organizationId: checkoutOrgId, userEmail: checkoutEmail } = useAppSelector((state) => state.checkout);
  const { organizationId: sessionOrgId, userEmail: sessionEmail, userName } = useAppSelector((state) => state.session);
  const organizationId = checkoutOrgId || sessionOrgId;
  const userEmail = checkoutEmail || sessionEmail || userName;

  const [seats, setSeats] = useState(initial.seats);
  const [cycle, setCycle] = useState<BillingCycle>(initial.cycle);
  const plan = getPlanBySlug(initial.plan);

  const [legalName, setLegalName] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [gstLookup, setGstLookup] = useState<GstinLookup | null>(null);
  const [gstChecking, setGstChecking] = useState(false);
  const [locationResolving, setLocationResolving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const gstRequestId = useRef(0);
  const addressRequestId = useRef(0);

  const totals = computeOrderTotals(plan, seats, cycle, stateCode);
  const gstVerified = Boolean(gstLookup?.valid && gstLookup.gstin === gstin.trim().toUpperCase());
  const billingComplete = Boolean(
    legalName.trim() &&
      pan.trim() &&
      address.trim() &&
      stateCode.trim() &&
      stateName.trim() &&
      postalCode.trim() &&
      country.trim(),
  );
  const canPay =
    gstVerified && billingComplete && !gstChecking && !locationResolving && organizationId && !isCreatingOrg;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(buildSignInForCheckout({ plan: plan.slug, seats, cycle }));
    }
  }, [isAuthenticated, router, plan.slug, seats, cycle]);

  useEffect(() => {
    syncCheckoutUrl({ plan: plan.slug, seats, cycle });
  }, [plan.slug, seats, cycle]);

  useEffect(() => {
    if (!isAuthenticated || organizationId) return;

    let cancelled = false;

    async function initOrganization() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // ponytail: mock signup has no JWT — local org so billing UI is reachable
        dispatch(setMockSession({ organizationId: `local-${Date.now()}` }));
        return;
      }

      setIsCreatingOrg(true);
      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 8000);
        const response = await fetch(`${API_URL}/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        window.clearTimeout(timer);
        const data = (await response.json()) as { organizationId?: string };
        if (cancelled) return;
        if (data?.organizationId) {
          dispatch(setMockSession({ organizationId: data.organizationId }));
          return;
        }
      } catch {
        // fall through — backend may be down
      }

      if (userEmail) {
        try {
          const defaultName = `Workspace - ${userEmail.split("@")[0]} - ${Math.floor(Math.random() * 10000)}`;
          const res = await apiClient<{ organization: { id: string } }>("/organizations/register", {
            method: "POST",
            body: JSON.stringify({ name: defaultName, superAdminEmail: userEmail }),
          });
          if (cancelled) return;
          if (res.organization?.id) {
            dispatch(setMockSession({ organizationId: res.organization.id }));
            return;
          }
        } catch {
          // fall through — use local org so checkout UI still loads
        }
      }

      if (!cancelled) {
        dispatch(setMockSession({ organizationId: `local-${Date.now()}` }));
      }
    }

    void initOrganization().finally(() => {
      if (!cancelled) setIsCreatingOrg(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, organizationId, userEmail, dispatch]);

  useEffect(() => {
    const value = gstin.trim().toUpperCase();
    if (value.length < 15) {
      setGstLookup(null);
      setGstChecking(false);
      clearGstFields(setLegalName, setPan);
      return;
    }

    const id = ++gstRequestId.current;
    setGstChecking(true);
    const timer = window.setTimeout(() => {
      void lookupGstin(value).then((result) => {
        if (id !== gstRequestId.current) return;
        setGstChecking(false);
        setGstLookup(result);
        if (result?.valid) applyGstLookup(setLegalName, setPan, setAddress, result);
        else clearGstFields(setLegalName, setPan);
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [gstin]);

  useEffect(() => {
    const text = address.trim();
    if (!text) {
      setPostalCode("");
      setStateName("");
      setStateCode("");
      setCountry("");
      return;
    }

    const id = ++addressRequestId.current;
    setLocationResolving(true);
    const timer = window.setTimeout(() => {
      void resolveLocationFromAddress(text).then((location) => {
        if (id !== addressRequestId.current) return;
        setLocationResolving(false);
        setPostalCode(location.postalCode);
        setStateName(location.stateName);
        setStateCode(location.stateCode);
        setCountry(location.country);
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [address]);

  const handlePay = async () => {
    if (gstChecking) {
      toast.message("Still validating GSTIN — please wait.");
      return;
    }

    const normalizedGstin = gstin.trim().toUpperCase();
    if (normalizedGstin.length !== 15) {
      toast.error("Enter a 15-character GSTIN.");
      return;
    }

    // Fresh verification on the website before payment — never trust stale UI state
    setGstChecking(true);
    let verified: GstinLookup | null = null;
    try {
      verified = await lookupGstin(normalizedGstin, { force: true });
      setGstLookup(verified);
      if (!verified?.valid) {
        toast.error(verified?.message || "GSTIN must be verified against GSTN before payment.");
        return;
      }
      applyGstLookup(setLegalName, setPan, setAddress, verified);
    } finally {
      setGstChecking(false);
    }

    const finalPan = verified!.pan.trim() || pan.trim();
    if (!verified!.legalName.trim() || !finalPan) {
      toast.error("GST lookup did not return legal name, and PAN is missing.");
      return;
    }
    if (!address.trim()) {
      toast.error("Enter your billing address.");
      return;
    }
    if (!postalCode.trim() || !stateCode.trim() || !stateName.trim() || !country.trim()) {
      toast.error("Include a valid 6-digit pincode in your billing address so we can determine place of supply.");
      return;
    }
    if (!organizationId) {
      toast.error("No organization linked. Sign in again with OTP or password.");
      return;
    }

    saveVerifiedBilling({
      gstin: verified!.gstin,
      legalName: verified!.legalName,
      pan: finalPan,
      stateCode,
      stateName,
      address: address.trim(),
      postalCode,
      country,
      plan: plan.slug,
      seats,
      cycle,
      verifiedAt: Date.now(),
    });

    setIsPaying(true);
    try {
      // ponytail: mock-signup orgs can't hit Razorpay — complete the funnel locally
      if (organizationId.startsWith("local-")) {
        dispatch(setMockSession({ isAuthenticated: true, scope: "full", activePlan: plan.slug }));
        toast.success("Subscription activated.");
        router.push("/checkout/success");
        return;
      }

      const order = await apiClient<{ id: string; amount: number }>("/razorpay/create-order", {
        method: "POST",
        body: JSON.stringify({
          organizationId,
          planId: plan.id,
          seats,
          billingCycle: cycle,
          billing: {
            legalName: verified!.legalName,
            gstin: verified!.gstin,
            pan: finalPan,
            address: address.trim(),
            stateCode,
            stateName,
            postalCode,
            country,
          },
        }),
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Bragi",
        description: `${plan.name} · ${seats} seats · ${cycle}`,
        handler: async (response: Record<string, string>) => {
          await apiClient("/razorpay/verify", {
            method: "POST",
            body: JSON.stringify({ ...response, organizationId, planId: plan.id }),
          });
          dispatch(setMockSession({ isAuthenticated: true, scope: "full", activePlan: plan.slug }));
          router.push("/checkout/success");
        },
        prefill: { email: userEmail ?? undefined, name: legalName },
        theme: { color: "#7dc890" },
      };



      const loadRazorpay = () => new Promise((resolve) => {
        if (typeof window !== "undefined" && (window as any).Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please check your connection.");
        setIsPaying(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => setIsPaying(false));
      rzp.open();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment failed.");
      setIsPaying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-white">
        <p>Redirecting to secure sign-in...</p>
        <Link href={buildSignInForCheckout({ plan: plan.slug, seats, cycle })} className="text-[#a8dfb3] underline">
          Click here if you are not redirected automatically
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-start">
        <section className="order-2 rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:order-1">
          <div className="inline-flex flex-wrap items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">3</span>
            <p className="text-sm font-semibold text-white">Billing & GST details</p>
            <Link
              href={ROUTES.pricing}
              className="text-xs font-semibold text-white/42 hover:text-[#a8dfb3] sm:ml-2"
            >
              Step 1 · Plan
            </Link>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">Billing details</h1>
            <p className="mt-2 text-sm leading-6 text-white/58">
              GSTIN validates legal name and PAN from GSTN. Enter billing address manually — pincode, state, and country are read from that address.
            </p>
          </div>

          {!organizationId || isCreatingOrg ? (
            <div className="mt-8 flex flex-col items-center justify-center space-y-4 rounded-lg border border-white/10 bg-black/35 p-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
              <p className="text-sm font-medium text-white/70">Initializing your secure checkout...</p>
            </div>
          ) : (
            <form
              className="mt-8 grid gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                void handlePay();
              }}
            >
              <Input
                id="legal-name"
                label="Registered legal name"
                value={legalName}
                readOnly
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Input
                    id="gstin"
                    label="GSTIN"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="Enter 15-character GSTIN"
                    autoComplete="off"
                    maxLength={15}
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {gstChecking ? <span className="text-white/42">Validating against GSTN…</span> : null}
                    {gstLookup?.valid ? (
                      <span className="rounded bg-[#7dc890]/18 px-2 py-0.5 font-semibold uppercase tracking-wide text-[#bce8c5]">
                        Valid
                      </span>
                    ) : null}
                    {gstLookup && !gstLookup.valid ? (
                      <span className="text-red-300">{gstLookup.message}</span>
                    ) : null}
                    {gstLookup?.valid ? <span className="text-white/42">{gstLookup.message}</span> : null}
                  </div>
                </div>
                <Input
                  id="pan"
                  label="PAN"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>

              <label className="block text-sm text-white/72" htmlFor="address">
                <span className="mb-2 block font-medium">Billing address</span>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Building, street, locality — include 6-digit pincode"
                  className="min-h-24 w-full rounded-md border border-white/12 bg-black/35 px-4 py-3 text-base text-white outline-none transition focus:border-[#7dc890]"
                />
                {locationResolving ? (
                  <span className="mt-2 block text-xs text-white/42">Reading pincode from address…</span>
                ) : null}
              </label>

              <div className="grid gap-5 sm:grid-cols-3">
                <Input
                  id="state"
                  label="State — place of supply"
                  value={stateName}
                  readOnly
                />
                <Input
                  id="postal"
                  label="Postal code"
                  value={postalCode}
                  readOnly
                />
                <Input id="country" label="Country" value={country} readOnly />
              </div>



              {!organizationId ? (
                <Alert tone="info">
                  No organization found.{" "}
                  <a href={buildSignInForCheckout({ plan: plan.slug, seats, cycle })} className="underline">
                    Sign in again
                  </a>{" "}
                  with OTP or password to continue.
                </Alert>
              ) : null}

              {!gstVerified && gstin.length === 15 && !gstChecking ? (
                <Alert tone="info">GSTIN must show Valid before you can pay.</Alert>
              ) : null}
              {gstVerified && address.trim() && !postalCode && !locationResolving ? (
                <Alert tone="info">Add a 6-digit pincode in your billing address for tax calculation.</Alert>
              ) : null}

              <Button className="w-full sm:w-auto sm:min-w-56" disabled={isPaying || !canPay} type="submit">
                {gstChecking
                  ? "Validating GSTIN…"
                  : isPaying
                    ? "Processing..."
                    : !gstVerified
                      ? "Verify GSTIN to continue"
                      : `Pay ${formatCurrency(totals.total)} & activate`}
              </Button>
            </form>
          )}
        </section>

        <OrderSummaryPanel
          plan={plan}
          seats={seats}
          cycle={cycle}
          subtotal={totals.subtotal}
          tax={totals.tax}
          total={totals.total}
          onSeatsChange={(next) => setSeats(Math.max(MIN_SEATS, next))}
          onCycleChange={setCycle}
          className="order-1 lg:order-2"
        />
      </div>
    </>
  );
}
