'use client';

import { Observer } from "tailwindcss-intersect";
import { useEffect } from "react";

export const ObserverProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    Observer.start();
  }, []);

  return <>{children}</>;
};
