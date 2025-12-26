import { buttonVariants } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { cn } from "@simplist/ui/lib/utils";
import { Ban, Clock, Envelope, TriangleExclamation } from "@gravity-ui/icons";
import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@simplist/db";
import Link from "next/link";
import { redirect } from "next/navigation";

type UserStatusReason =
  | "TERMS_VIOLATION"
  | "ILLEGAL_CONTENT"
  | "HATEFUL_CONTENT"
  | "OBSCENE_CONTENT"
  | "IP_INFRINGEMENT"
  | "PRIVACY_VIOLATION"
  | "MALWARE"
  | "UNAUTHORIZED_ACCESS"
  | "RATE_LIMIT_ABUSE"
  | "SECURITY_BYPASS"
  | "SCRAPING_ABUSE"
  | "PAYMENT_FAILURE"
  | "LEGAL_REQUEST"
  | "SECURITY_RISK"
  | "FRAUD"
  | "SPAM"
  | "OTHER";

const reasonLabels: Record<UserStatusReason, string> = {
  TERMS_VIOLATION: "violation of our terms of service",
  ILLEGAL_CONTENT: "illegal content",
  HATEFUL_CONTENT: "hateful or discriminatory content",
  OBSCENE_CONTENT: "inappropriate content",
  IP_INFRINGEMENT: "intellectual property infringement",
  PRIVACY_VIOLATION: "privacy violation",
  MALWARE: "malicious code distribution",
  UNAUTHORIZED_ACCESS: "unauthorized access attempt",
  RATE_LIMIT_ABUSE: "rate limit abuse",
  SECURITY_BYPASS: "security bypass attempt",
  SCRAPING_ABUSE: "abusive scraping",
  PAYMENT_FAILURE: "payment failure",
  LEGAL_REQUEST: "a legal request",
  SECURITY_RISK: "security concerns",
  FRAUD: "fraudulent activity",
  SPAM: "spam",
  OTHER: "a policy violation",
};

const statusConfig = {
  suspended: {
    title: "Your account has been suspended",
    icon: Clock,
  },
  banned: {
    title: "Your account has been banned",
    icon: Ban,
  },
  disabled: {
    title: "Your account has been disabled",
    icon: TriangleExclamation,
  },
};

const AccountRestrictedPage = async () => {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/auth/login?redirect=/account-restricted");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      status: true,
      statusReasonCode: true,
      statusReason: true,
      suspensionEndsAt: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const getRestrictionType = () => {
    if (user.status === "SUSPENDED") return "suspended";
    if (user.status === "BANNED") return "banned";
    if (user.status === "DISABLED") return "disabled";
    return null;
  };

  const restrictionType = getRestrictionType();

  if (!restrictionType) {
    redirect("/");
  }

  const config = statusConfig[restrictionType];
  const Icon = config.icon;

  const reasonCode = user.statusReasonCode as UserStatusReason | null;
  const reasonLabel = reasonCode
    ? reasonLabels[reasonCode]
    : "a policy violation";
  const additionalReason = user.statusReason;

  const suspensionEndsAt = user.suspensionEndsAt
    ? new Date(user.suspensionEndsAt)
    : null;

  const description =
    restrictionType === "suspended"
      ? `Your access has been temporarily restricted due to ${reasonLabel}.`
      : restrictionType === "banned"
        ? `Your account has been permanently terminated due to ${reasonLabel}.`
        : `Your account is currently inactive due to ${reasonLabel}.`;

  return (
    <div className="flex min-h-screen flex-col">
      <Empty className="flex flex-1 items-center justify-center">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
          <EmptyTitle>{config.title}</EmptyTitle>
          <EmptyDescription>
            {description}
            {additionalReason && (
              <>
                <br />
                {additionalReason}
              </>
            )}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex items-center gap-2">
            <Link
              href="mailto:support@simplist.blog"
              className={cn(buttonVariants())}
            >
              <Envelope />
              Contact
            </Link>
            <Link
              href="/auth/logout"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Sign Out
            </Link>
          </div>
        </EmptyContent>
      </Empty>

      {restrictionType === "suspended" && suspensionEndsAt && (
        <div className="px-4 py-4 text-center">
          <p className="text-muted-foreground text-sm">
            Access will be restored on{" "}
            <span className="text-foreground font-medium">
              {suspensionEndsAt.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountRestrictedPage;
