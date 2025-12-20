"use client";

import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Skeleton } from "../skeleton";

export const ClientOnly: FC<PropsWithChildren> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Skeleton className="h-full w-full" />;
  }

  return <>{children}</>;
};
