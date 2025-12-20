"use client";

import { useEffect } from "react";
import { Observer } from "tailwindcss-intersect";

export const ObserverProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    Observer.start();
  }, []);

  return <>{children}</>;
};
