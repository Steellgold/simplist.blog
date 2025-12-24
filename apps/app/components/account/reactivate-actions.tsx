"use client";

import { cancelAccountDeletion } from "@/lib/actions/account-deletion";
import { ArrowRightFromSquare, CircleCheckFill } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import { CardFooter } from "@simplist/ui/components/card";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";

type Props = {
  hasPendingDeletion: boolean;
};

export const ReactivateActions = ({ hasPendingDeletion }: Props) => {
  const [redirectPath] = useQueryState("redirect", { defaultValue: "/" });
  const [isRestoring, setIsRestoring] = useState(false);

  const router = useRouter();

  const handleRestore = async () => {
    setIsRestoring(true);
    toast.promise(cancelAccountDeletion(), {
      loading: "Restoring your account...",
      success: () => {
        router.push(redirectPath);
        return "Account restored";
      },
      error: (err) => {
        setIsRestoring(false);
        const message =
          err instanceof Error ? err.message : "Failed to restore account";
        return message;
      },
    });
  };

  return (
    <CardFooter className="flex flex-col gap-3 sm:flex-row">
      <Button
        onClick={handleRestore}
        disabled={!hasPendingDeletion || isRestoring}
        className="flex-1"
      >
        {isRestoring ? (
          <>
            <Spinner />
            Restoring...
          </>
        ) : (
          <>
            <CircleCheckFill />
            Cancel deletion
          </>
        )}
      </Button>

      <Button
        variant="outline"
        className="flex-1"
        onClick={() => router.push("/auth/login?redirect=/reactivate")}
      >
        <ArrowRightFromSquare />
        Go to login
      </Button>
    </CardFooter>
  );
};
