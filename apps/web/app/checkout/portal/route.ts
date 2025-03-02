import { polar } from "@/lib/polar";
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req: NextRequest): Promise<NextResponse> => {
  const customerId = req.nextUrl.searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  const portal = await polar.customerSessions.create({
    customerId: customerId
  });

  console.log(portal);

  if (!portal) {
    return NextResponse.json({ error: "Failed to create portal" }, { status: 500 });
  }

  return NextResponse.json({ url: portal.customerPortalUrl });
}