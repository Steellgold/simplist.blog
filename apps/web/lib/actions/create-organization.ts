"use server"

import { redirect } from "next/navigation";
import { polar } from "../polar";
import { auth } from "../auth";
import { headers } from "next/headers";
import { PlanNameToPrices } from "@workspace/ui/lib/pricing";

export const createOrganization = async (organizationName: string, plan: "Pro" | "Business", interval: "monthly" | "yearly") => {
  const session =      await auth.api.getSession({ headers: await headers() });
  const organization = await auth.api.getFullOrganization({ headers: await headers() });

  if (!session || !organization) throw new Error("Not authenticated");

  const info = PlanNameToPrices(plan);

  const checkout = await polar.checkouts.create({
    productId: info[interval].productId,
    successUrl: new URL("/checkout/success?checkout_id={CHECKOUT_ID}", process.env.PUBLIC_BETTER_AUTH_URL).toString(),
    metadata: { organizationId: organization.id }
  })

  redirect(checkout.url);
};