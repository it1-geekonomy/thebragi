"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { brand } from "@/config/brand";
import { setMockSession } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { apiClient, getApiErrorMessage, getApiUrl } from "@/shared/lib/api-client";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { razorpayApi } from "@/features/subscription/api";
import { paymentApi } from "@/features/subscription/services/paymentApi";
import {
  useRazorpayCheckout,
  type RazorpaySuccessResponse,
} from "@/features/subscription/hooks/useRazorpayCheckout";
import {
  buildCheckoutPath,
  buildSignInForCheckout,
  type BillingCycle,
  type CheckoutParams,
  type PurchaseMode,
} from "@/features/checkout/lib/checkout-params";
import {
  clampSeats,
  computeOrderTotals,
  TRIAL_AUTHORIZATION_PAISE,
  TRIAL_AUTHORIZATION_RUPEES,
} from "@/features/checkout/lib/order-math";
import {
  lookupGstin,
  resolveLocationFromAddress,
  stateNameFromCode,
  type GstinLookup,
  type TaxBreakdown,
} from "@/features/checkout/lib/gst";
import { saveVerifiedBilling } from "@/features/checkout/lib/billing-session";
import { clearSignupDraft, readSignupDraft } from "@/features/checkout/lib/billing-session";
import { INDIAN_STATES, SELLER_STATE_CODE } from "@/features/checkout/lib/gst-states";
import { Select } from "@/shared/components/ui/Select";
import { OrderSummaryPanel } from "@/features/checkout/components/OrderSummaryPanel";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";
import { fetchAuthSessionDetails } from "@/features/auth/lib/post-auth-routing";

// ponytail: GSTN lookup skipped for local checkout testing
const SKIP_GST_VALIDATION = true;

function syncCheckoutUrl(params: CheckoutParams) {
  const path = buildCheckoutPath(params);
  window.history.replaceState(null, "", path);
}

function applyGstLookup(
  setters: {
    setLegalName: (value: string) => void;
    setPan: (value: string) => void;
    setAddress: (value: string) => void;
    setStateCode: (value: string) => void;
    setStateName: (value: string) => void;
    setCountry: (value: string) => void;
  },
  result: GstinLookup,
) {
  if (result.legalName) setters.setLegalName(result.legalName);
  if (result.pan) setters.setPan(result.pan);
  if (result.address) setters.setAddress(result.address);
  const code = result.gstin.slice(0, 2);
  const name = stateNameFromCode(code);
  if (name !== "Unknown") {
    setters.setStateCode(code);
    setters.setStateName(name);
  }
  setters.setCountry("India");
}

export function BillingCheckout({ initial }: { initial: CheckoutParams }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.session.isAuthenticated);
  const { organizationId: checkoutOrgId, userEmail: checkoutEmail } = useAppSelector((state) => state.checkout);
  const { organizationId: sessionOrgId, userEmail: sessionEmail, userName } = useAppSelector((state) => state.session);
  const [signupDraft] = useState(() => readSignupDraft());
  const organizationId = checkoutOrgId || sessionOrgId;
  const userEmail = checkoutEmail || sessionEmail || signupDraft?.email || userName;
  const purchaseMode: PurchaseMode = initial.mode;
  const { initializePayment } = useRazorpayCheckout();

  const [seats, setSeats] = useState(initial.seats);
  const [cycle, setCycle] = useState<BillingCycle>(initial.cycle);
  const { plans, loading } = useSubscriptionPlans();
  const plan = plans.find((item) => item.slug === initial.plan);
  const minimumSeats = plan?.minimumSeats ?? 0;
  const maximumSeats = plan?.maximumSeats;
  const resolvedSeats = plan
    ? clampSeats(seats || plan.minimumSeats, plan.minimumSeats, plan.maximumSeats)
    : seats;

  const [legalName, setLegalName] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [gstLookup, setGstLookup] = useState<GstinLookup | null>(null);
  const [gstChecking, setGstChecking] = useState(false);
  const [locationResolving, setLocationResolving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const gstRequestId = useRef(0);
  const addressRequestId = useRef(0);

  const totals = plan
    ? computeOrderTotals(plan, resolvedSeats, cycle, stateCode, SELLER_STATE_CODE)
    : ({
        subtotal: 0,
        recurringSubtotal: 0,
        tax: { kind: "intra", totalTax: 0, cgst: 0, sgst: 0, igst: 0 } as TaxBreakdown,
        total: 0,
        basePrice: 0,
        perUser: 0,
        overageSeats: 0,
        setupFee: 0,
      } satisfies {
        subtotal: number;
        recurringSubtotal: number;
        tax: TaxBreakdown;
        total: number;
        basePrice: number;
        perUser: number;
        overageSeats: number;
        setupFee: number;
      });

  useEffect(() => {
    if (!isAuthenticated && !signupDraft) {
      // replace — push + syncCheckoutUrl's history.replaceState race and cancel soft nav
      router.replace(
        buildSignInForCheckout(
          { plan: initial.plan, seats: resolvedSeats, cycle, mode: purchaseMode },
          "signup",
        ),
      );
      return;
    }
    if (!loading && !plan) {
      router.replace(ROUTES.pricing);
    }
  }, [cycle, initial.plan, isAuthenticated, loading, plan, purchaseMode, resolvedSeats, router, signupDraft]);

  useEffect(() => {
    // Don't rewrite history while redirecting users who still need an account.
    if (!isAuthenticated && !signupDraft) return;
    syncCheckoutUrl({ plan: initial.plan, seats: resolvedSeats, cycle, mode: purchaseMode });
  }, [cycle, initial.plan, isAuthenticated, purchaseMode, resolvedSeats, signupDraft]);

  useEffect(() => {
    if (!isAuthenticated || organizationId || signupDraft) return;

    let cancelled = false;

    async function hydrateOrganization() {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 8000);
        const response = await fetch(`${getApiUrl()}/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        window.clearTimeout(timer);
        const data = (await response.json()) as { organizationId?: string };
        if (cancelled) return;
        if (data.organizationId) {
          dispatch(setMockSession({ organizationId: data.organizationId }));
        }
      } catch {
        // session hydrate is best-effort
      }
    }

    void hydrateOrganization();
    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated, organizationId, signupDraft]);

  useEffect(() => {
    if (SKIP_GST_VALIDATION) return;
    const value = gstin.trim().toUpperCase();
    if (value.length < 15) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- drop GST validity until a full number is entered
      setGstLookup(null);
      setGstChecking(false);
      return;
    }

    const requestId = ++gstRequestId.current;
    setGstChecking(true);
    const timer = window.setTimeout(() => {
      void lookupGstin(value).then((result) => {
        if (requestId !== gstRequestId.current) return;
        setGstChecking(false);
        setGstLookup(result);
        if (result?.valid) {
          applyGstLookup(
            { setLegalName, setPan, setAddress, setStateCode, setStateName, setCountry },
            result,
          );
        }
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [gstin]);

  useEffect(() => {
    const text = address.trim();
    if (!text) return;

    const requestId = ++addressRequestId.current;
    setLocationResolving(true);
    const timer = window.setTimeout(() => {
      void resolveLocationFromAddress(text).then((location) => {
        if (requestId !== addressRequestId.current) return;
        setLocationResolving(false);
        if (location.postalCode) setPostalCode(location.postalCode);
        if (location.stateName) setStateName(location.stateName);
        if (location.stateCode) setStateCode(location.stateCode);
        if (location.country) setCountry(location.country);
        if (location.city) setCity(location.city);
      });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [address]);

  async function handlePay() {
    if (!plan) return;
    const normalizedGstin = gstin.trim().toUpperCase();
    let verified: GstinLookup | null = null;

    if (!SKIP_GST_VALIDATION) {
      if (gstChecking) {
        toast.message("Still validating GSTIN, please wait.");
        return;
      }
      if (normalizedGstin.length !== 15) {
        toast.error("Enter a 15-character GSTIN.");
        return;
      }

      setGstChecking(true);
      try {
        verified = await lookupGstin(normalizedGstin, { force: true });
        setGstLookup(verified);
        if (!verified?.valid) {
          toast.error(verified?.message || "GSTIN must be verified against GSTN before payment.");
          return;
        }
      } finally {
        setGstChecking(false);
      }

      if (!verified) {
        toast.error("Unable to verify GSTIN right now.");
        return;
      }
    }

    const finalLegalName = legalName.trim() || verified?.legalName.trim() || "";
    const finalPan = pan.trim() || verified?.pan.trim() || "";
    const finalStateCode = stateCode.trim() || verified?.gstin.slice(0, 2) || "";
    const finalStateName =
      stateName.trim() || (stateNameFromCode(finalStateCode) !== "Unknown" ? stateNameFromCode(finalStateCode) : "");
    const finalCountry = country.trim() || "India";
    const finalCity = city.trim();
    if (!finalLegalName || !finalPan) {
      toast.error("Enter registered legal name and PAN.");
      return;
    }
    if (!address.trim()) {
      toast.error("Enter your billing address.");
      return;
    }
    if (!postalCode.trim() || !finalStateCode || !finalStateName || !finalCountry || !finalCity) {
      toast.error("Enter city, state, postal code, and country.");
      return;
    }
    if (!organizationId && !signupDraft) {
      toast.error("Create an account to continue checkout.");
      router.push(
        buildSignInForCheckout(
          { plan: initial.plan, seats: resolvedSeats, cycle, mode: purchaseMode },
          "signup",
        ),
      );
      return;
    }

    saveVerifiedBilling({
      gstin: verified?.gstin || normalizedGstin,
      legalName: finalLegalName,
      pan: finalPan,
      stateCode: finalStateCode,
      stateName: finalStateName,
      address: address.trim(),
      city: finalCity,
      postalCode,
      country: finalCountry,
      plan: plan.slug,
      seats: resolvedSeats,
      cycle,
      verifiedAt: Date.now(),
    });

    setIsPaying(true);
    try {
      const billing = {
        legalName: finalLegalName,
        gstin: verified?.gstin || normalizedGstin,
        pan: finalPan,
        address: address.trim(),
        stateCode: finalStateCode,
        stateName: finalStateName,
        city: finalCity,
        postalCode,
        country: finalCountry,
      };

      const trialOrder =
        purchaseMode !== "trial"
          ? null
          : organizationId
            ? await paymentApi.createTrialAuth({
                organizationId,
                planId: plan.id,
                billingCycle: cycle,
              })
            : signupDraft?.resume
              ? await paymentApi.resumeTrialAuth({
                  email: signupDraft.email,
                  password: signupDraft.password,
                })
              : signupDraft
                ? await paymentApi.createTrialAuth({
                    name: signupDraft.company,
                    superAdminEmail: signupDraft.email,
                    superAdminName: signupDraft.fullName,
                    industry: signupDraft.industry,
                    adminPassword: signupDraft.password,
                    phone: signupDraft.phone,
                    city: finalCity,
                    planId: plan.id,
                    billingCycle: cycle,
                  })
                : null;

      if (purchaseMode === "trial" && !trialOrder) {
        toast.error("Create an account to start the trial.");
        setIsPaying(false);
        return;
      }

      if (purchaseMode === "buy_now" && !organizationId && !signupDraft) {
        toast.error("Create an account or sign in to buy this plan.");
        setIsPaying(false);
        return;
      }

      const buyNowOrder =
        purchaseMode !== "buy_now"
          ? null
          : await razorpayApi.createBuyNowOrder({
              ...(organizationId
                ? { organizationId }
                : signupDraft
                  ? {
                      name: signupDraft.company,
                      superAdminEmail: signupDraft.email,
                      superAdminName: signupDraft.fullName,
                      industry: signupDraft.industry,
                      adminPassword: signupDraft.password,
                      phone: signupDraft.phone,
                      city: finalCity,
                    }
                  : {}),
              planId: plan.id,
              seats: resolvedSeats,
              billingCycle: cycle,
              billing,
            });

      const razorpayKey =
        buyNowOrder?.keyId ??
        trialOrder?.keyId ??
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
        "";
      if (!razorpayKey.startsWith("rzp_test_") && process.env.NODE_ENV !== "production") {
        toast.error("Local checkout requires a Razorpay test key (rzp_test_…).");
        setIsPaying(false);
        return;
      }

      // Trial: backend amount is paise. Buy Now amount/quote are rupees; amountPaise is authoritative.
      const trialPaise =
        trialOrder?.amountPaise ??
        (typeof trialOrder?.amount === "number" && trialOrder.amount >= 100
          ? trialOrder.amount
          : TRIAL_AUTHORIZATION_PAISE);
      const buyNowRupees = buyNowOrder?.quote?.total ?? buyNowOrder?.amount ?? totals.total;
      const buyNowPaise = buyNowOrder?.amountPaise ?? Math.round(buyNowRupees * 100);

      await initializePayment(
        {
          key: razorpayKey,
          currency: buyNowOrder?.currency ?? trialOrder?.currency ?? "INR",
          amount: purchaseMode === "trial" ? trialPaise : buyNowPaise,
          order_id:
            purchaseMode === "trial"
              ? (trialOrder?.orderId ?? trialOrder?.id)
              : (buyNowOrder?.orderId ?? buyNowOrder?.id),
          name: brand.name,
          description:
            purchaseMode === "trial"
              ? `Free Trial Authorization — ${formatCurrency(TRIAL_AUTHORIZATION_RUPEES)}`
              : `${plan.name} · ${resolvedSeats} seats · ${cycle} · ${formatCurrency(buyNowRupees)}`,
          prefill: { email: userEmail ?? undefined, name: legalName },
          theme: { color: brand.colors.greenBright },
        },
        async (response: RazorpaySuccessResponse) => {
          const pendingTrialId = trialOrder?.pendingTrialId ?? buyNowOrder?.pendingTrialId;
          const billingProfile = {
            registeredLegalName: billing.legalName,
            gstin: billing.gstin,
            panNumber: billing.pan,
            streetAddress: billing.address,
            city: billing.city,
            state: billing.stateName,
            postalCode: billing.postalCode,
            country: billing.country,
          };

          let paidOrganizationId = organizationId;

          if (purchaseMode === "trial") {
            if (!pendingTrialId) throw new Error("Missing trial checkout id.");
            const verified = await paymentApi.verifyTrialAuth({
              ...response,
              pendingTrialId,
            });
            paidOrganizationId = verified.organizationId ?? paidOrganizationId;
          } else {
            const verified = await razorpayApi.verifyBuyNowPayment({
              ...response,
              ...(organizationId ? { organizationId } : { pendingTrialId }),
              planId: plan.id,
              seats: resolvedSeats,
            });
            paidOrganizationId = verified.organizationId ?? paidOrganizationId;
          }

          if (signupDraft) {
            const loginData = await apiClient<{ accessToken: string; user?: { name?: string } }>("/auth/login", {
              method: "POST",
              body: JSON.stringify({ email: signupDraft.email, password: signupDraft.password }),
            });
            localStorage.setItem("accessToken", (loginData.accessToken ?? "").replace(/^Bearer\s+/i, ""));
            clearSignupDraft();
          }

          if (paidOrganizationId && localStorage.getItem("accessToken")) {
            try {
              await paymentApi.updateOrganizationProfile(paidOrganizationId, billingProfile);
            } catch {
              // payment already succeeded — don't fail checkout if profile save is rejected
            }
          }

          const token = localStorage.getItem("accessToken");
          const details = token ? await fetchAuthSessionDetails(token).catch(() => null) : null;
          dispatch(
            setMockSession({
              isAuthenticated: true,
              scope: "full",
              userEmail: signupDraft?.email ?? details?.userEmail ?? userEmail,
              userName: signupDraft?.fullName ?? details?.userName ?? userName,
              activePlan: details?.activePlan ?? plan.slug,
              subscriptionStatus:
                details?.subscriptionStatus ?? (purchaseMode === "trial" ? "trialing" : "active"),
              organizationId: details?.organizationId ?? paidOrganizationId,
              trialStartedAt: details?.trialStartedAt ?? null,
              trialEndsAt: details?.trialEndsAt ?? null,
            }),
          );
          router.push("/checkout/success");
        },
        (error) => {
          toast.error(error?.message || "Payment failed.");
          setIsPaying(false);
        },
      );
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Payment failed."));
      setIsPaying(false);
    }
  }

  if ((!isAuthenticated && !signupDraft) || loading || !plan) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-white">
        <p>{loading ? "Loading plans..." : "Redirecting to create your account..."}</p>
        <Link
          href={buildSignInForCheckout(
            { plan: initial.plan, seats: resolvedSeats, cycle, mode: purchaseMode },
            "signup",
          )}
          className="text-[#a8dfb3] underline"
        >
          Click here if you are not redirected automatically
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-start">
      <section className="order-2 rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:order-1">
        <div className="inline-flex items-center gap-3">
          <p className="text-sm font-semibold text-white">Billing & GST details</p>
          <Link href={ROUTES.pricing} className="text-xs font-semibold text-white/42 hover:text-[#a8dfb3] sm:ml-2">
            Step 1 · Plan
          </Link>
        </div>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {purchaseMode === "trial" ? "Trial billing details" : "Billing details"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/58">
            {purchaseMode === "trial"
              ? `GSTIN validates legal name and PAN from GSTN. This path authorizes only ${formatCurrency(TRIAL_AUTHORIZATION_RUPEES)} for trial activation.`
              : "GSTIN validates legal name and PAN from GSTN. The backend receives plan, seats, billing cycle, and billing details before Razorpay is opened."}
          </p>
        </div>

        {!organizationId && !signupDraft ? (
          <div className="mt-8 flex flex-col items-center justify-center space-y-4 rounded-lg border border-white/10 bg-black/35 p-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
            <p className="text-sm font-medium text-white/70">Preparing checkout...</p>
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
              onChange={(event) => setLegalName(event.target.value)}
              placeholder="Auto-filled from GSTIN, or type manually"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Input
                  id="gstin"
                  label="GSTIN"
                  value={gstin}
                  onChange={(event) => setGstin(event.target.value.toUpperCase())}
                  placeholder="Enter 15-character GSTIN"
                  autoComplete="off"
                  maxLength={15}
                />
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {gstChecking ? <span className="text-white/42">Validating against GSTN...</span> : null}
                  {gstLookup?.valid ? (
                    <span className="rounded bg-[#7dc890]/18 px-2 py-0.5 font-semibold uppercase tracking-wide text-[#bce8c5]">
                      Valid
                    </span>
                  ) : null}
                  {gstLookup && !gstLookup.valid ? <span className="text-red-300">{gstLookup.message}</span> : null}
                  {gstLookup?.valid ? <span className="text-white/42">{gstLookup.message}</span> : null}
                </div>
              </div>
              <Input
                id="pan"
                label="PAN"
                value={pan}
                onChange={(event) => setPan(event.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>

            <label className="block text-sm text-white/72" htmlFor="address">
              <span className="mb-2 block font-medium">Billing address</span>
              <textarea
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Building, street, locality - include 6-digit pincode"
                className="min-h-24 w-full appearance-none rounded-md border border-white/15 bg-[#111a13] px-4 py-3 text-[16px] text-white outline-none [color-scheme:dark] transition placeholder:text-white/35 focus:border-[#7dc890] focus:ring-2 focus:ring-[#7dc890]/25"
              />
              {locationResolving ? <span className="mt-2 block text-xs text-white/42">Reading pincode from address...</span> : null}
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="city"
                label="City"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Bengaluru"
              />
              <label className="block text-sm text-white/80" htmlFor="state">
                <span className="mb-2 block font-medium">State - place of supply</span>
                <Select
                  id="state"
                  className="w-full"
                  value={stateCode}
                  onChange={(event) => {
                    const code = event.target.value;
                    setStateCode(code);
                    setStateName(code ? stateNameFromCode(code) : "");
                  }}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </Select>
              </label>
              <Input
                id="postal"
                label="Postal code"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit pincode"
                inputMode="numeric"
                maxLength={6}
              />
              <Input
                id="country"
                label="Country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="India"
              />
            </div>

            <Button className="w-full" disabled={isPaying} type="submit">
              {isPaying
                ? "Processing..."
                : purchaseMode === "trial"
                  ? `Authorize ${formatCurrency(TRIAL_AUTHORIZATION_RUPEES)} & start trial`
                  : `Pay ${formatCurrency(totals.total)} & activate`}
            </Button>
          </form>
        )}
      </section>

      <OrderSummaryPanel
        plan={plan}
        seats={resolvedSeats}
        cycle={cycle}
        subtotal={totals.subtotal}
        tax={totals.tax}
        total={totals.total}
        basePrice={totals.basePrice}
        perUserPrice={totals.perUser}
        overageSeats={totals.overageSeats}
        setupFee={totals.setupFee}
        minimumSeats={minimumSeats}
        maximumSeats={maximumSeats}
        purchaseMode={purchaseMode}
        onSeatsChange={(next) => setSeats(clampSeats(next, minimumSeats, maximumSeats))}
        onCycleChange={setCycle}
        className="order-1 lg:order-2"
      />
    </div>
  );
}

