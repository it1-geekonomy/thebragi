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
  panFromGstin,
  resolveLocationFromAddress,
  resolveLocationFromPostalCode,
  type GstinLookup,
} from "@/features/checkout/lib/gst";
import { saveVerifiedBilling } from "@/features/checkout/lib/billing-session";
import { clearSignupDraft, readSignupDraft } from "@/features/checkout/lib/billing-session";
import { SearchableSelect } from "@/shared/components/ui/SearchableSelect";
import { OrderSummaryPanel } from "@/features/checkout/components/OrderSummaryPanel";
import { useSubscriptionPlans } from "@/features/subscription/hooks/useSubscriptionPlans";
import { fetchAuthSessionDetails } from "@/features/auth/lib/post-auth-routing";

import { subscriptionApi, type SubscriptionQuote } from "@/features/subscription/api";

// GSTN live lookup disabled until GST_VALIDATION_API_KEY is configured on the CRM backend.
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
  if (code) {
    setters.setStateCode(code);
  }
  setters.setCountry("IN");
}

export function BillingCheckout({ initial }: { initial: CheckoutParams }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.session.isAuthenticated);
  const { organizationId, userEmail: sessionEmail, userName } = useAppSelector((state) => state.session);
  const [signupDraft] = useState(() => readSignupDraft());
  const userEmail = sessionEmail || signupDraft?.email || userName;
  const purchaseMode: PurchaseMode = initial.mode;
  const { initializePayment } = useRazorpayCheckout();

  const [users, setSeats] = useState(initial.users);
  const [cycle, setCycle] = useState<BillingCycle>(initial.cycle);
  const { plans, loading } = useSubscriptionPlans();
  const plan = plans.find((item) => item.slug === initial.plan);
  const minimumSeats = plan?.minimumSeats ?? 0;
  const maximumSeats = plan?.maximumSeats;
  const resolvedSeats = plan
    ? clampSeats(users || plan.minimumSeats, plan.minimumSeats, plan.maximumSeats)
    : users;

  const [legalName, setLegalName] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("IN");
  const [city, setCity] = useState("");
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [states, setStates] = useState<{ code: string; name: string }[]>([]);
  const [gstLookup, setGstLookup] = useState<GstinLookup | null>(null);
  const [gstChecking, setGstChecking] = useState(false);
  const [locationResolving, setLocationResolving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [quote, setQuote] = useState<SubscriptionQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const gstRequestId = useRef(0);
  const addressRequestId = useRef(0);

  const totals = plan
    ? computeOrderTotals(plan, resolvedSeats, cycle)
    : ({
        subtotal: 0,
        recurringSubtotal: 0,
        total: 0,
        basePrice: 0,
        perUser: 0,
        overageSeats: 0,
        setupFee: 0,
      } satisfies {
        subtotal: number;
        recurringSubtotal: number;
        total: number;
        basePrice: number;
        perUser: number;
        overageSeats: number;
        setupFee: number;
      });

  useEffect(() => {
    if (!plan?.id) return;
    let active = true;
    setLoadingQuote(true);
    const timer = window.setTimeout(() => {
      subscriptionApi
        .calculateQuote({
          planId: plan.id,
          seats: resolvedSeats,
          users: resolvedSeats,
          billingCycle: cycle,
          stateCode: stateCode || undefined,
        })
        .then((data) => {
          if (active) setQuote(data);
        })
        .catch((err) => {
          console.error("Failed to fetch calculation quote:", err);
        })
        .finally(() => {
          if (active) setLoadingQuote(false);
        });
    }, 150);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [plan?.id, resolvedSeats, cycle, stateCode]);

  useEffect(() => {
    fetch("/api/location/countries")
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!country) {
      setStates([]);
      return;
    }
    fetch(`/api/location/states?country=${country}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStates(data);
          if (stateName && !stateCode) {
            const match = data.find(
              (s: { code: string; name: string }) =>
                s.name.toLowerCase() === stateName.toLowerCase()
            );
            if (match) setStateCode(match.code);
          } else if (stateCode && !stateName) {
            const match = data.find(
              (s: { code: string; name: string }) =>
                s.code.toLowerCase() === stateCode.toLowerCase()
            );
            if (match) setStateName(match.name);
          }
        }
      })
      .catch(() => {});
  }, [country, stateCode, stateName]);

  useEffect(() => {
    if (!isAuthenticated && !signupDraft) {
      // replace — push + syncCheckoutUrl's history.replaceState race and cancel soft nav
      router.replace(
        buildSignInForCheckout(
          { plan: initial.plan, users: resolvedSeats, cycle, mode: purchaseMode },
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
    syncCheckoutUrl({ plan: initial.plan, users: resolvedSeats, cycle, mode: purchaseMode });
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
    const value = gstin.trim().toUpperCase();

    const extractedPan = panFromGstin(value);
    if (extractedPan) {
      setPan(extractedPan);
    }

    if (SKIP_GST_VALIDATION) return;
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

  useEffect(() => {
    const code = postalCode.trim();
    if (!/^\d{6}$/.test(code)) return;

    void resolveLocationFromPostalCode(code).then((location) => {
      if (location.stateName) setStateName(location.stateName);
      if (location.stateCode) setStateCode(location.stateCode);
      if (location.country) setCountry(location.country);
      if (location.city && !city) setCity(location.city);
    });
  }, [postalCode]);

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
    } else if (normalizedGstin.length !== 15) {
      toast.error("Enter a 15-character GSTIN.");
      return;
    }

    const finalLegalName = legalName.trim() || verified?.legalName.trim() || "";
    const finalPan = pan.trim() || verified?.pan.trim() || "";
    const finalStateCode = stateCode.trim() || verified?.gstin.slice(0, 2) || "";
    const finalStateName = stateName.trim() || states.find(s => s.code === finalStateCode)?.name || "";
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
          { plan: initial.plan, users: resolvedSeats, cycle, mode: purchaseMode },
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
      users: resolvedSeats,
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
                users: resolvedSeats,
                billingCycle: cycle,
                billing,
              })
            : signupDraft?.resume &&
                signupDraft.authProvider !== "google" &&
                signupDraft.authProvider !== "microsoft"
              ? await paymentApi.resumeTrialAuth({
                  email: signupDraft.email,
                  password: signupDraft.password,
                })
              : signupDraft
                ? await paymentApi.createTrialAuth({
                    name: signupDraft.company?.trim() || billing.legalName.trim(),
                    superAdminEmail: signupDraft.email,
                    superAdminName: signupDraft.fullName,
                    industry: signupDraft.industry || undefined,
                    ...(signupDraft.authProvider === "google" ||
                    signupDraft.authProvider === "microsoft"
                      ? {
                          authProvider: signupDraft.authProvider,
                          providerUserId: signupDraft.providerUserId,
                          emailVerified: signupDraft.emailVerified ?? true,
                        }
                      : { adminPassword: signupDraft.password }),
                    phone: signupDraft.phone,
                    city: finalCity,
                    planId: plan.id,
                    users: resolvedSeats,
                    billingCycle: cycle,
                    billing,
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
          : await paymentApi.createBuyNowOrder({
              ...(organizationId
                ? { organizationId }
                : signupDraft
                  ? {
                      name: signupDraft.company?.trim() || billing.legalName.trim(),
                      superAdminEmail: signupDraft.email,
                      superAdminName: signupDraft.fullName,
                      industry: signupDraft.industry || undefined,
                      ...(signupDraft.authProvider === "google" ||
                      signupDraft.authProvider === "microsoft"
                        ? {
                            authProvider: signupDraft.authProvider,
                            providerUserId: signupDraft.providerUserId,
                            emailVerified: signupDraft.emailVerified ?? true,
                          }
                        : { adminPassword: signupDraft.password }),
                      phone: signupDraft.phone,
                      city: finalCity,
                    }
                  : {}),
              planId: plan.id,
              users: resolvedSeats,
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
      const buyNowRupees = buyNowOrder?.quote?.total ?? buyNowOrder?.amount ?? quote?.totalAmount ?? totals.total;
      const buyNowPaise = buyNowOrder?.amountPaise ?? quote?.amountPaise ?? Math.round(buyNowRupees * 100);

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
              : `${plan.name} · ${resolvedSeats} users · ${cycle} · ${formatCurrency(buyNowRupees)}`,
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
              billing,
            });
            paidOrganizationId = verified.organizationId ?? paidOrganizationId;
          } else {
            const verified = await paymentApi.verifyBuyNowPayment({
              ...response,
              ...(organizationId ? { organizationId } : { pendingTrialId }),
              planId: plan.id,
              users: resolvedSeats,
            });
            paidOrganizationId = verified.organizationId ?? paidOrganizationId;
          }

          if (signupDraft) {
            try {
              if (
                (signupDraft.authProvider === "google" ||
                  signupDraft.authProvider === "microsoft") &&
                signupDraft.idToken
              ) {
                const loginData = await apiClient<{ accessToken: string }>("/auth/oauth", {
                  method: "POST",
                  body: JSON.stringify({
                    authProvider: signupDraft.authProvider,
                    idToken: signupDraft.idToken,
                  }),
                });
                localStorage.setItem(
                  "accessToken",
                  (loginData.accessToken ?? "").replace(/^Bearer\s+/i, ""),
                );
              } else if (signupDraft.password) {
                const loginData = await apiClient<{ accessToken: string; user?: { name?: string } }>(
                  "/auth/login",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      email: signupDraft.email,
                      password: signupDraft.password,
                    }),
                  },
                );
                localStorage.setItem(
                  "accessToken",
                  (loginData.accessToken ?? "").replace(/^Bearer\s+/i, ""),
                );
              }
            } catch (authError) {
              console.warn("Auto-login following payment verification failed:", authError);
              toast.info("Payment successful! Please sign in to access your account.");
            } finally {
              clearSignupDraft();
            }
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
              isAuthenticated: Boolean(token),
              scope: token ? "full" : "anonymous",
              isNewSignup: Boolean(signupDraft),
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
          router.push(purchaseMode === "trial" ? ROUTES.billingConfirmation : "/checkout/success");
        },
        (error) => {
          const message = error?.message || "Payment failed.";
          toast.error(message);
          setIsPaying(false);
          if (/cancel/i.test(message)) {
            router.push(
              `/checkout/cancel?plan=${encodeURIComponent(plan.slug)}&cycle=${cycle}&mode=${purchaseMode}&users=${resolvedSeats}`,
            );
          }
        },
      );
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error, "Payment failed.");
      if (/already exists|already registered/i.test(msg)) {
        toast.error(msg, {
          action: {
            label: "Sign in",
            onClick: () =>
              router.push(
                buildSignInForCheckout({
                  plan: initial.plan,
                  users: resolvedSeats,
                  cycle,
                  mode: purchaseMode,
                }),
              ),
          },
        });
      } else {
        toast.error(msg);
      }
      setIsPaying(false);
    }
  }

  if ((!isAuthenticated && !signupDraft) || loading || !plan) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-white">
        <p>{loading ? "Loading plans..." : "Redirecting to create your account..."}</p>
        <Link
          href={buildSignInForCheckout(
            { plan: initial.plan, users: resolvedSeats, cycle, mode: purchaseMode },
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
        <div className="mt-8">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            Billing details
          </h1>
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
              placeholder={SKIP_GST_VALIDATION ? "Registered company legal name" : "Auto-filled from GSTIN, or type manually"}
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
                  {!SKIP_GST_VALIDATION && gstChecking ? (
                    <span className="text-white/42">Validating against GSTN...</span>
                  ) : null}
                  {!SKIP_GST_VALIDATION && gstLookup?.valid ? (
                    <span className="rounded bg-[#7dc890]/18 px-2 py-0.5 font-semibold uppercase tracking-wide text-[#bce8c5]">
                      Valid
                    </span>
                  ) : null}
                  {!SKIP_GST_VALIDATION && gstLookup && !gstLookup.valid ? (
                    <span className="text-red-300">{gstLookup.message}</span>
                  ) : null}
                  {!SKIP_GST_VALIDATION && gstLookup?.valid ? (
                    <span className="text-white/42">{gstLookup.message}</span>
                  ) : null}
                </div>
              </div>
              <Input
                id="pan"
                label="PAN *"
                value={pan}
                onChange={(event) => setPan(event.target.value.toUpperCase())}
                maxLength={10}
                required
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
              <label className="block text-sm text-white/80" htmlFor="country">
                <span className="mb-2 block font-medium">Country</span>
                <SearchableSelect
                  id="country"
                  value={country}
                  onChange={(val: string) => {
                    setCountry(val);
                    setStateCode("");
                    setStateName("");
                  }}
                  options={countries.map(c => ({ value: c.code, label: c.name }))}
                  placeholder="Select country"
                />
              </label>
              <label className="block text-sm text-white/80" htmlFor="state">
                <span className="mb-2 block font-medium">State / Province</span>
                <SearchableSelect
                  id="state"
                  value={stateCode}
                  onChange={(val: string) => {
                    setStateCode(val);
                    setStateName(states.find((s) => s.code === val)?.name || "");
                  }}
                  options={states.map(s => ({ value: s.code, label: s.name }))}
                  placeholder="Select state"
                />
              </label>
              <Input
                id="city"
                label="City"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Bengaluru"
              />
              <Input
                id="postal"
                label="Postal code"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit pincode"
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            <Button className="w-full" disabled={isPaying} type="submit">
              {isPaying
                ? "Processing..."
                : purchaseMode === "trial"
                  ? `Authorize ${formatCurrency(TRIAL_AUTHORIZATION_RUPEES)} & start trial`
                  : `Pay ${formatCurrency(quote?.totalAmount ?? totals.total)} & activate`}
            </Button>
          </form>
        )}
      </section>

      <OrderSummaryPanel
        plan={plan}
        users={resolvedSeats}
        cycle={cycle}
        subtotal={totals.subtotal}
        total={totals.total}
        basePrice={totals.basePrice}
        perUserPrice={totals.perUser}
        overageSeats={totals.overageSeats}
        setupFee={totals.setupFee}
        minimumSeats={minimumSeats}
        maximumSeats={maximumSeats}
        purchaseMode={purchaseMode}
        quote={quote}
        loadingQuote={loadingQuote}
        onSeatsChange={(next) => setSeats(clampSeats(next, minimumSeats, maximumSeats))}
        onCycleChange={setCycle}
        className="order-1 lg:order-2"
      />
    </div>
  );
}

