import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { polar } from "@/lib/polar";
import { getPeriodTypeByPID, getPlanByCriteria } from "@workspace/ui/lib/pricing";
import { z } from "zod";
import { headers } from "next/headers";
import { dayJS } from "@/lib/dayjs";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const checkout_id = searchParams.get("checkout_id");
  const customer_session_token = searchParams.get("customer_session_token");

  if (!checkout_id || !customer_session_token) {
    return NextResponse.json({ error: "Invalid checkout_id" }, { status: 400 });
  }

  try {
    const paymentResponse = await polar.checkouts.get({ id: checkout_id });

    if (paymentResponse.status === "succeeded" && dayJS().diff(dayJS(paymentResponse.createdAt), "minute") > 5) {
      return NextResponse.redirect(new URL("/settings/billing?success=false", request.url).toString());
    }

    if (paymentResponse.status === "succeeded") {
      const organizationId = paymentResponse.metadata.organizationId;
      const schema = z.object({ organizationId: z.string() }).safeParse({ organizationId });

      if (!schema.success) {
        return NextResponse.json({ error: "Invalid organizationId" }, { status: 400 });
      }

      const plan = getPlanByCriteria({ productId: paymentResponse.productId });
      const isYearly = getPeriodTypeByPID(paymentResponse.productId) === "yearly";

      await auth.api.updateOrganization({
        headers: await headers(),
        body: {
          organizationId: schema.data.organizationId,
          data: {
            metadata: {
              plan: plan?.name.toLowerCase(),
              startedAt: dayJS(),
              endsAt: dayJS()
                .add(isYearly ? 1 : 0, "year")
                .add(isYearly ? 0 : 1, "month")
                .toISOString(),
              //
              subscriptionId: paymentResponse.subscriptionId,
              checkoutId: paymentResponse.id,
              customerId: paymentResponse.customerId
            }
          }
        }
      });

      return NextResponse.redirect(new URL("/settings/billing?success=true", request.url).toString());
    } else {
      return NextResponse.json({ error: "Payment not succeeded" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};