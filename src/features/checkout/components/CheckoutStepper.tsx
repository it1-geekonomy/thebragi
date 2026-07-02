"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setMockSession } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/shared/components/ui/Button";
import { Alert } from "@/shared/components/ui/Alert";
import { formatCurrency } from "@/shared/lib/format-currency";
import { usePlans } from "@/features/pricing/hooks/usePlans";
import { apiClient } from "@/shared/lib/api-client";
import Script from "next/script";

function PaymentStep({ planSlug }: { planSlug?: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { organizationId: checkoutOrgId, userEmail: checkoutEmail } = useAppSelector((state) => state.checkout);
  const { organizationId: sessionOrgId, userName } = useAppSelector((state) => state.session);
  const organizationId = checkoutOrgId || sessionOrgId;
  const userEmail = checkoutEmail || userName;
  const { plans, isLoading } = usePlans();
  const plan = plans.find((item) => item.slug === planSlug) ?? plans[0];
  const planId = plan?.id;
  const [isPaying, setIsPaying] = useState(false);

  if (isLoading) {
    return <div className="mt-8 text-center text-white/70">Loading plan details...</div>;
  }

  if (!plan) {
    return <div className="mt-8 text-center text-red-500">Plan not found. Please select a valid plan.</div>;
  }


  const handlePayment = async () => {
    if (!organizationId) {
      toast.error("No organization linked to your account. Please sign in using OTP or Password (not quick login).");
      return;
    }
    if (!planId) {
      toast.error("Plan not found. Please go back to pricing and select a plan.");
      return;
    }
    setIsPaying(true);
    try {
      const order = await apiClient<{ id: string; amount: number }>("/razorpay/create-order", {
        method: "POST",
        body: JSON.stringify({ organizationId, planId }),
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Bragi",
        description: `${plan.name} Subscription`,
        handler: async (response: any) => {
          await apiClient("/razorpay/verify", {
            method: "POST",
            body: JSON.stringify({ ...response, organizationId, planId }),
          });
          dispatch(setMockSession({ isAuthenticated: true, scope: "full", activePlan: plan.slug }));
          router.push("/checkout/success");
        },
        prefill: { email: userEmail },
        theme: { color: "#7dc890" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => setIsPaying(false));
      rzp.open();
    } catch (err: any) {
      toast.error(err.message);
      setIsPaying(false);
    }
  };

  return (
    <div className="mt-8 grid gap-5">
      {!organizationId && (
        <Alert tone="info">
          ⚠️ No organization found for your account. Please{" "}
          <a href={`/sign-in?returnTo=/checkout?plan=${planSlug}`} className="underline">sign in again</a>{" "}
          using OTP or Password tab to proceed with payment.
        </Alert>
      )}
      <Alert tone="success">Verification complete. You can now securely complete your payment.</Alert>
      <div className="rounded-lg border border-white/10 bg-black/35 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-white/48">Billed monthly. Terms apply.</p>
          </div>
          <p className="text-2xl font-semibold text-white">{formatCurrency(plan.priceMonthly)}</p>
        </div>
      </div>
      <Button disabled={isPaying || !organizationId} onClick={handlePayment}>
        {isPaying ? "Processing..." : `Pay ${formatCurrency(plan.priceMonthly)}`}
      </Button>
    </div>
  );
}

export function CheckoutStepper({ planSlug }: { planSlug?: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.session.isAuthenticated);
  const { organizationId: checkoutOrgId, userEmail: checkoutEmail } = useAppSelector((state) => state.checkout);
  const { organizationId: sessionOrgId, userEmail: sessionEmail } = useAppSelector((state) => state.session);
  const organizationId = checkoutOrgId || sessionOrgId;
  const userEmail = checkoutEmail || sessionEmail;
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const isCreatingRef = useRef(false);

  // If authenticated but organizationId missing (e.g. mock sign-in), fetch it from /auth/session
  useEffect(() => {
    if (isAuthenticated && !organizationId) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.organizationId) {
              dispatch(setMockSession({ organizationId: data.organizationId }));
            }
          })
          .catch(() => {/* ignore — will show error at payment time */});
      }
    }
  }, [isAuthenticated, organizationId, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      const returnTo = planSlug ? `/checkout?plan=${planSlug}` : "/checkout";
      router.push(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [isAuthenticated, router, planSlug]);

  const handleCreateOrg = useCallback(async () => {
    if (!userEmail || isCreatingRef.current) return;
    isCreatingRef.current = true;
    setIsCreatingOrg(true);
    try {
      const defaultName = `Workspace - ${userEmail.split("@")[0]} - ${Math.floor(Math.random() * 10000)}`;
      const res = await apiClient<{ organization: any; user: any }>("/organizations/register", {
        method: "POST",
        body: JSON.stringify({ name: defaultName, superAdminEmail: userEmail }),
      });
      if (res.organization?.id) {
        dispatch(setMockSession({ organizationId: res.organization.id }));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize checkout.");
      setIsCreatingOrg(false); // only reset on error so we don't spam
      isCreatingRef.current = false;
    }
  }, [userEmail, dispatch]);

  useEffect(() => {
    // Automatically create a default workspace if the user doesn't have one
    // so we can proceed to payment without asking for a company name.
    if (isAuthenticated && !organizationId && userEmail && !isCreatingRef.current) {
      handleCreateOrg();
    }
  }, [isAuthenticated, organizationId, userEmail, handleCreateOrg]);

  if (!isAuthenticated) {
    return null; // Return nothing while redirecting
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Checkout</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Complete your payment</h1>
        <p className="mt-3 text-sm leading-6 text-white/58">Securely process your subscription.</p>
      </div>
      
      {!organizationId ? (
        <div className="mt-8 flex flex-col items-center justify-center space-y-4 rounded-lg border border-white/10 bg-black/35 p-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent"></div>
          <p className="text-sm font-medium text-white/70">Initializing your secure checkout...</p>
        </div>
      ) : (
        <PaymentStep planSlug={planSlug} />
      )}
      
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
