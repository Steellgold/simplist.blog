"use client";

import { authClient } from "@/lib/auth-client";
import { Permissions } from "@/lib/permissions";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Component } from "@workspace/ui/components/utils/component";
import { X } from "lucide-react";
import { PropsWithChildren, ReactElement, useEffect, useState } from "react";

type GuardProps = PropsWithChildren & {
  need?: Permissions;
  elseElement?: ReactElement | string;
};

const permissionCache: { [key: string]: { hasPermission: boolean; timestamp: number } } = {};
const permissionCacheOrgId: { [key: string]: string } = {};

const CACHE_DURATION = 5 * 60 * 1000;

export const Guard: Component<GuardProps> = ({ children, need, elseElement }) => {
  const [has, setHas] = useState<boolean | null>(null);
  const [pending, setPending] = useState(true);

  const { data } = authClient.useActiveOrganization();

  useEffect(() => {
    if (need == undefined) {
      setHas(true);
      setPending(false);
      return;
    }

    const permissionKey = JSON.stringify(need);
    const now = Date.now();

    if (
      permissionCache[permissionKey] && now - permissionCache[permissionKey].timestamp < CACHE_DURATION
      && permissionCacheOrgId["org_id"] == data?.id
    ) {
      setHas(permissionCache[permissionKey].hasPermission);
      setPending(false);
      return;
    }

    const check = async () => {
      setPending(true);

      const res = await fetch("/api/auth/organization/has-permission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permission: need,
        }),
      });

      let hasPermission = false;
      if (res.ok) {
        const data = await res.json();
        hasPermission = data.success;
      }

      permissionCache[permissionKey] = { hasPermission, timestamp: now };
      permissionCacheOrgId["org_id"] = data?.id || "";

      setHas(hasPermission);
      setPending(false);
    };

    check();
  }, [need, data]);

  if (need == undefined) return <>{children}</>;
  if (pending) return <Skeleton className="min-h-6 h-full w-full" />;
  if (has === false) return (
    <>
      {typeof elseElement === "string" ? <NotPermitted message={elseElement} /> : typeof elseElement !== "string" ? elseElement : undefined}
    </>
  )

  if (has === null) return <></>;
  return <>{children}</>;
};

type NotPermittedProps = {
  message?: string;
};

export const NotPermitted: Component<NotPermittedProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-2 border border-dashed rounded-lg">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-dashed" aria-hidden="true">
        <X className="h-5 w-5 text-destructive" />
      </div>

      <p className="text-sm text-center text-muted-foreground">
        {message || "You do not have permission to view this page."}
      </p>
    </div>
  )
}