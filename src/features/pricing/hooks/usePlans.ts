"use client";

import { useEffect, useState } from "react";
import { planCatalog } from "@/config/plans";

export type Plan = {
  id?: string;
  name: string;
  pricePerUser?: number;
  setupCost?: number;
  maxUsers?: number;
  salesModuleAccess?: boolean;
  projectModuleAccess?: boolean;
  slug: string;
  description: string;
  modules: string[];
  popular?: boolean;
  priceMonthly: number; // Keep this for fallback UI rendering
};

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>(planCatalog as Plan[]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/plans`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Using preview pricing until plans API is ready.");
        const backendPlans = await response.json();
        return backendPlans.map((bp: any) => {
          // Map to planCatalog UI fields based on name matching (or fallback)
          const catalogItem = planCatalog.find(p => p.name.includes(bp.name) || bp.name.includes(p.name)) || {
            slug: bp.name.toLowerCase().replace(/\s+/g, '-'),
            description: bp.description || "Standard CRM Plan",
            modules: ["Core Features"],
            popular: false,
            name: bp.name, // Ensure we don't overwrite with undefined
          };
          return {
            ...catalogItem,
            id: bp.id,
            name: bp.name,
            pricePerUser: bp.pricePerUser,
            setupCost: bp.setupCost,
            maxUsers: bp.maxUsers,
            salesModuleAccess: bp.salesModuleAccess,
            projectModuleAccess: bp.projectModuleAccess,
            priceMonthly: bp.pricePerUser, // Map priceMonthly to pricePerUser for UI display
          } as Plan;
        });
      })
      .then((data) => {
        if (active) setPlans(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Using preview pricing.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { plans, isLoading, error };
}
