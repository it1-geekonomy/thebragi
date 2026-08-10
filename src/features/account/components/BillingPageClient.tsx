"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/config/routes";
import { subscriptionApi, SubscriptionStatus } from "@/features/subscription/api";
import { useAppSelector } from "@/store/hooks";

export function BillingPageClient() {
  const { organizationId } = useAppSelector((state) => state.session);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchStatus = () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    subscriptionApi.getSubscriptionStatus(organizationId)
      .then(setStatus)
      .catch((err) => toast.error("Failed to load subscription status"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, [organizationId]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your auto-pay subscription? This action cannot be undone.")) return;
    
    setCancelling(true);
    try {
      await subscriptionApi.cancelAutoPay();
      toast.success("Subscription auto-pay cancelled.");
      fetchStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7dc890] border-t-transparent" />
      </div>
    );
  }

  const badgeColor = status?.status === "ACTIVE" ? "bg-[#7dc890] text-black" : 
                     status?.status === "TRIAL" ? "bg-blue-300 text-black" : 
                     status?.status === "PAST_DUE" ? "bg-red-400 text-white" : "";

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7dc890]">Account</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Billing</h1>
          <p className="mt-2 text-sm text-white/52">Manage your subscription and billing details.</p>
        </div>
        <Link className="text-sm font-semibold text-[#a8dfb3] hover:text-white" href={ROUTES.pricing}>Compare plans</Link>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Current plan</h2>
            {status?.status ? (
              <span className={`px-2 py-1 text-xs font-semibold rounded-md ${badgeColor}`}>{status.status}</span>
            ) : (
              <Badge>No Active Plan</Badge>
            )}
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{status?.plan || "No Plan"}</p>
          
          {status?.status === "TRIAL" && (
            <p className="mt-2 text-sm text-white/52">
              Your trial ends on {status.endDate ? new Date(status.endDate).toLocaleDateString() : "N/A"}. ({status.daysRemaining} days remaining)
            </p>
          )}

          {status?.status === "ACTIVE" && (
            <p className="mt-2 text-sm text-white/52">
              Next renewal: {status.endDate ? new Date(status.endDate).toLocaleDateString() : "N/A"}.
              {status.autoPayEnabled ? " Auto-pay is active." : " Auto-pay is inactive."}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={() => window.location.href = ROUTES.pricing}>Change Plan</Button>
            {status?.autoPayEnabled && (
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? "Cancelling..." : "Cancel Auto-Pay"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
