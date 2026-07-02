"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/api-client";

export type Plan = {
  id: string;
  name: string;
  pricePerUser: number;
  setupCost: number;
  maxUsers: number;
  salesModuleAccess: boolean;
  projectModuleAccess: boolean;
  slug: string;
  description: string;
  modules: string[];
  popular?: boolean;
  priceMonthly: number;
};

/** Build a human-friendly module list from the boolean flags */
function buildModuleList(bp: any): string[] {
  const modules: string[] = [];
  if (bp.salesModuleAccess) modules.push("Sales pipeline", "Deals & leads");
  if (bp.projectModuleAccess) modules.push("Project management", "Tasks & delivery");
  if (bp.salesModuleAccess && bp.projectModuleAccess) modules.push("Unified dashboard");
  modules.push("Email support");
  return modules;
}

/** Build a short description from the plan's capabilities */
function buildDescription(bp: any): string {
  if (bp.salesModuleAccess && bp.projectModuleAccess) {
    return "Sales and projects in one connected workspace.";
  }
  if (bp.salesModuleAccess) {
    return "Pipeline and deal flow for lean sales teams.";
  }
  if (bp.projectModuleAccess) {
    return "Project delivery and task tracking after the sale.";
  }
  return "Standard CRM plan for your team.";
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiClient<any[]>("/subscription/plans")
      .then((backendPlans) => {
        const data: Plan[] = backendPlans.map((bp, index) => ({
          id: bp.id,
          name: bp.name,
          pricePerUser: Number(bp.pricePerUser),
          setupCost: Number(bp.setupCost ?? 0),
          maxUsers: bp.maxUsers ?? 0,
          salesModuleAccess: !!bp.salesModuleAccess,
          projectModuleAccess: !!bp.projectModuleAccess,
          slug: bp.name.toLowerCase().replace(/\s+/g, "-"),
          description: buildDescription(bp),
          modules: buildModuleList(bp),
          popular: bp.salesModuleAccess && bp.projectModuleAccess,
          priceMonthly: Number(bp.pricePerUser),
        }));
        if (active) setPlans(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load plans from server.");
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
