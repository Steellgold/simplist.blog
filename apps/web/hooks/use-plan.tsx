"use client";

import { authClient } from "@/lib/auth-client";
import { PlanName } from "@workspace/ui/lib/pricing";
import { useEffect, useMemo, useState } from "react";

export const usePlan = (referenceId: string) => {
  const { list } = useMemo(() => authClient.subscription, []);
  const [plan, setPlan] = useState<PlanName>("Hobby");
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlan = async () => {
      setIsPending(true);
      try {
        const { data } = await list({
          query: { referenceId },
        });

        const plan = data?.[0];
        if (plan) {
          setPlan(
            (plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1)) as PlanName
          );
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
      } finally {
        setIsPending(false);
      }
    };

    if (referenceId) {
      fetchPlan();
    }
  }, [referenceId]);

  return { plan, isPending };
};
