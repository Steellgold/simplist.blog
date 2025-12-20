"use client";

import { getPaymentMethodIcon } from "@/lib/payment-method-icons";
import type { BillingEntry, PaymentMethodInfo } from "@/lib/stripe/types";
import { Badge } from "@simplist/ui/components/badge";
import { buttonVariants } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@simplist/ui/components/item";
import {
  CheckCircle,
  CircleX,
  Download,
  LifeBuoy,
  Loader2,
  Receipt,
} from "lucide-react";
import Link from "next/link";

type BillingItemProps = {
  entry: BillingEntry;
};

const getStatusColor = (status: string | null) => {
  if (!status) return "secondary";

  switch (status) {
    case "paid":
    case "succeeded":
      return "default";
    case "open":
    case "processing":
      return "secondary";
    case "draft":
      return "outline";
    case "void":
    case "canceled":
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusLabelAndIcon = (status: string | null) => {
  if (!status) return { label: "Unknown", icon: CheckCircle };

  switch (status) {
    case "succeeded":
    case "paid":
      return { label: "Paid", icon: CheckCircle };
    case "open":
    case "processing":
      return { label: "Processing", icon: Loader2 };
    case "void":
    case "canceled":
    case "failed":
      return { label: "Failed", icon: CircleX };
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        icon: CheckCircle,
      };
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const formatPaymentMethod = (
  paymentMethod: PaymentMethodInfo | null | undefined,
) => {
  if (!paymentMethod) return { text: "No payment method", icon: null };

  if (
    paymentMethod.type === "card" &&
    paymentMethod.brand &&
    paymentMethod.last4
  ) {
    return {
      text: `•••• ${paymentMethod.last4}`,
      icon: getPaymentMethodIcon(paymentMethod.brand),
    };
  }

  // For other payment methods
  return {
    text:
      paymentMethod.type.charAt(0).toUpperCase() +
      paymentMethod.type.slice(1).replace("_", " "),
    icon: getPaymentMethodIcon(paymentMethod.type),
  };
};

export const BillingItem = ({ entry }: BillingItemProps) => {
  const pmInfo = formatPaymentMethod(entry.paymentMethod);

  return (
    <Item variant="muted">
      <ItemMedia variant="icon">
        <Receipt />
      </ItemMedia>

      <ItemContent>
        <ItemTitle>
          Invoice
          {entry.number && (
            <span className="bg-muted/90 text-muted-foreground rounded-xs px-1.5 py-0.5 font-mono text-xs">
              {entry.number}
            </span>
          )}
        </ItemTitle>

        <ItemDescription className="flex items-center gap-1">
          <Badge variant={getStatusColor(entry.status)}>
            {(() => {
              const { label, icon: IconComponent } = getStatusLabelAndIcon(
                entry.status,
              );
              return (
                <span className="flex items-center gap-1">
                  {IconComponent && <IconComponent className="size-3" />}
                  <span>{label}</span>
                </span>
              );
            })()}
          </Badge>

          <Badge variant="outline">{formatDate(entry.date)}</Badge>

          <Badge variant="outline">
            {pmInfo.icon}
            <span>{pmInfo.text}</span>
          </Badge>
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <ButtonGroup>
          <Link
            href={entry.invoicePdfUrl || ""}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download />
            Download
          </Link>

          <Link
            href={`mailto:support@simplist.blog?subject=Invoice ${entry.number}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <LifeBuoy />
            Support
          </Link>
        </ButtonGroup>
      </ItemActions>
    </Item>
  );
};
