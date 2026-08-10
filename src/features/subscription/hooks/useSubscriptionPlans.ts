import { useEffect, useState } from "react";
import { subscriptionApi } from "@/features/subscription/api";

export interface DynamicPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  perUserCostMonthly: number;
  perUserCostAnnual: number;
  annualDiscountPercentage: number;
  maxUsers: number;
  setupFee: number;
  popular?: boolean;
  badge?: string;
}

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<DynamicPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    subscriptionApi
      .getPlans()
      .then((data: any) => {
        if (active) {
          const mappedPlans = data.map((apiPlan: any) => {
            const monthlyPriceObj = apiPlan.prices?.find((p: any) => p.billingCycle?.toLowerCase() === "monthly");
            const annualPriceObj = apiPlan.prices?.find((p: any) => p.billingCycle?.toLowerCase() === "annual");

            return {
              id: apiPlan.id,
              slug: apiPlan.id,
              name: apiPlan.name,
              description: `Maximum ${apiPlan.maxUsers > 0 ? apiPlan.maxUsers : "unlimited"} users`,
              priceMonthly: Number(monthlyPriceObj?.price || 0),
              priceAnnual: Number(annualPriceObj?.price || 0),
              perUserCostMonthly: Number(monthlyPriceObj?.perUserCost || 0),
              perUserCostAnnual: Number(annualPriceObj?.perUserCost || 0),
              annualDiscountPercentage: Number(apiPlan.annualDiscountPercentage || 20),
              maxUsers: apiPlan.maxUsers,
              setupFee: Number(apiPlan.setupCost || 0),
            };
          });
          setPlans(mappedPlans);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load plans");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { plans, loading, error };
}
