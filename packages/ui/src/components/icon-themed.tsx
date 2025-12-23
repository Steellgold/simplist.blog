"use client";

import { useTheme } from "next-themes";
import { ReactElement, useEffect, useState } from "react";

interface IconThemedProps {
  light: ReactElement;
  dark: ReactElement;
  className?: string;
}

export function IconThemed({ light, dark, className }: IconThemedProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) return <span className={className} />;

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  return <span className={className}>{isDark ? dark : light}</span>;
}
