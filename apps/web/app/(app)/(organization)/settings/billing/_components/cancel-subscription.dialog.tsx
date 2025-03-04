"use client";

import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";
import { ReactElement, useState } from "react";

// TODO: Implement the cancel subscription dialog, when clicked open a modal with a confirmation message and an button to contact support if need in secondary and the cancel subscription button in primary (yellow)
export const CancelSubscriptionDialog = (): ReactElement => {
  const [pending, setPending] = useState(false);

  return (
    <Button
      onClick={() => setPending(true)}
      disabled={pending} size={"sm"}
    >
      {pending ? <><Loader2 className="animate-spin" /> Cancel Subscription</> : "Cancel Subscription"}
    </Button>
  );
}