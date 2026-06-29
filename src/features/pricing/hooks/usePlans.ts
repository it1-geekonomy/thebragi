"use client";

import { useEffect, useState } from "react";
import { planCatalog } from "@/config/plans";

export type Plan = (typeof planCatalog)[number];

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>(planCatalog);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/v1/plans", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Using preview pricing until plans API is ready.");
        return (await response.json()) as Plan[];
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
