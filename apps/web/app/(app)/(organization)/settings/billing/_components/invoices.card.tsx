import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Component } from "@workspace/ui/components/utils/component";
import Stripe from "stripe";
import { CustomerPortalButton } from "./customer-portal.button";
import { Receipt, ReceiptEuro, ReceiptText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { dayJS } from "@/lib/dayjs";

export const BillingInvoicesCard: Component<Stripe.Response<Stripe.ApiList<Stripe.Charge>>> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>View and download your invoices</CardDescription>
        </div>
        <CustomerPortalButton />
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((charge) => (
          <div key={charge.id} className="flex flex-row items-center justify-between first:border p-2 rounded-md">
            <div className="flex flex-col">
              <div>
                Receipt #{charge.receipt_number}
                {!charge.livemode && <Badge variant="outline" className="ml-2">Test Mode</Badge>}
              </div>

              <p className="text-sm text-muted-foreground">
                {dayJS(charge.created * 1000).format("MMMM D, YYYY")}
              </p>
            </div>

            <div className="flex flex-row items-center space-x-4">
              <div>{charge.currency.toUpperCase() === "USD" ? "$" : "€"}{charge.amount / 100}</div>

              <Button asChild size="sm">
                <Link href={charge.receipt_url || ""} target="_blank">
                  {
                    charge.currency == "usd" ? <Receipt /> :
                    charge.currency == "eur" ? <ReceiptEuro /> :
                    <ReceiptText />
                  }
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}