import { useEffect, useState } from "react";
import { subscriptionApi, type Plan as ApiPlan } from "@/features/subscription/api";

type PricingModel = "included_overage" | "per_seat";

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
  includedUsers: number;
  minimumSeats: number;
  maxUsers: number;
  maximumSeats: number;
  pricingModel: PricingModel;
  setupFee: number;
  popular?: boolean;
  badge?: string;
  isEnterprise?: boolean;
}

function getPricingModel(apiPlan: ApiPlan, monthlyPerUserCost: number, annualPerUserCost: number): PricingModel {
  if (apiPlan.pricingModel === "included_overage" || apiPlan.pricingModel === "per_seat") {
    return apiPlan.pricingModel;
  }

  return (apiPlan.includedUsers ?? apiPlan.maxUsers ?? 0) > 0 && (monthlyPerUserCost > 0 || annualPerUserCost > 0)
    ? "included_overage"
    : "per_seat";
}

function mapApiPlans(data: ApiPlan[]): DynamicPlan[] {
  const mappedPlans = data.map((apiPlan) => {
    const monthlyPriceObj = apiPlan.prices?.find((p) => p.billingCycle?.toLowerCase() === "monthly");
    const annualPriceObj = apiPlan.prices?.find((p) => p.billingCycle?.toLowerCase() === "annual");
    const monthlyPerUserCost = Number(monthlyPriceObj?.perUserCost || 0);
    const annualPerUserCost = Number(annualPriceObj?.perUserCost || 0);
    const pricingModel = getPricingModel(apiPlan, monthlyPerUserCost, annualPerUserCost);
    const includedUsers = Number(apiPlan.includedUsers ?? apiPlan.maxUsers ?? 0);
    const minimumSeats = Number(
      apiPlan.minimumSeats || (pricingModel === "included_overage" && includedUsers > 0 ? includedUsers : 3),
    );
    const discountPct = Number(apiPlan.annualDiscountPercentage || 0);
    const userLimitLabel =
      pricingModel === "included_overage" && includedUsers > 0 ? includedUsers : "unlimited";

    return {
      id: apiPlan.id,
      slug: apiPlan.id,
      name: apiPlan.name,
      description: `Includes up to ${userLimitLabel} users`,
      priceMonthly: Number(monthlyPriceObj?.price || 0),
      priceAnnual: Number(annualPriceObj?.price || 0),
      perUserCostMonthly: monthlyPerUserCost,
      perUserCostAnnual: annualPerUserCost,
      annualDiscountPercentage: discountPct,
      includedUsers,
      minimumSeats,
      maxUsers: includedUsers,
      maximumSeats: Math.max(minimumSeats, includedUsers > 0 ? includedUsers * 10 : 100),
      pricingModel,
      setupFee: Number(apiPlan.setupCost || 0),
    };
  });

  const enterprisePlan: DynamicPlan = {
    id: "enterprise-plan-static",
    slug: "enterprise",
    name: "Enterprise",
    description: "Custom built for large scale organizations",
    priceMonthly: 0,
    priceAnnual: 0,
    perUserCostMonthly: 0,
    perUserCostAnnual: 0,
    annualDiscountPercentage: 0,
    includedUsers: 0,
    minimumSeats: 25,
    maxUsers: 0,
    maximumSeats: 0,
    pricingModel: "per_seat",
    setupFee: 0,
    isEnterprise: true,
  };

  return [...mappedPlans, enterprisePlan];
}

// In-memory cache & request deduplication to prevent repetitive network calls across views
let cachedPlans: DynamicPlan[] | null = null;
let activePlansPromise: Promise<DynamicPlan[]> | null = null;

async function fetchAndCachePlans(): Promise<DynamicPlan[]> {
  if (cachedPlans) return cachedPlans;
  if (!activePlansPromise) {
    activePlansPromise = subscriptionApi
      .getPlans()
      .then((data) => {
        const result = mapApiPlans(data);
        cachedPlans = result;
        activePlansPromise = null;
        return result;
      })
      .catch((err) => {
        activePlansPromise = null;
        throw err;
      });
  }
  return activePlansPromise;
}

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<DynamicPlan[]>(() => cachedPlans ?? []);
  const [loading, setLoading] = useState<boolean>(() => !cachedPlans);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedPlans) {
      setPlans(cachedPlans);
      setLoading(false);
      return;
    }

    let active = true;
    fetchAndCachePlans()
      .then((data) => {
        if (active) {
          setPlans(data);
          setError(null);
        }
      })
      .catch((err: { message?: string }) => {
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
