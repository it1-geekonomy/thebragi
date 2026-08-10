export type PlanFeature = {
  label: string;
  included: boolean;
};

export type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual?: number;
  perUserCostMonthly?: number;
  perUserCostAnnual?: number;
  annualDiscountPercentage?: number;
  maxUsers?: number;
  features?: PlanFeature[];
  popular?: boolean;
  badge?: string;
  modules?: string[];
};
