"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { cn } from "@simplist/ui/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { FC, useCallback, useEffect, useState } from "react";
import { Skeleton } from "../skeleton";

export type Theme = "light" | "dark" | "system";

const themes = [
  { key: "system", icon: Monitor, label: "System theme" },
  { key: "light", icon: Sun, label: "Light theme" },
  { key: "dark", icon: Moon, label: "Dark theme"},
];

export type ThemeSwitcherProps = {
  value?: Theme;
  onChange?: (theme: Theme) => void;
  defaultValue?: Theme;
  className?: string;
  variant?: "default" | "card";
  with2XB?: boolean;
};

export const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ value, onChange, defaultValue, className, variant = "default", with2XB = false }) => {
  const { theme: currentTheme, setTheme: setT } = useTheme();

  const [theme, setTheme] = useControllableState({
    defaultProp: defaultValue ?? (currentTheme as Theme),
    prop: value,
    onChange,
  });

  const [mounted, setMounted] = useState(false);

  const handleThemeClick = useCallback(
    (themeKey: Theme) => {
      setTheme(themeKey);
      setT(themeKey);
    },
    [setTheme, setT]
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(with2XB && "border rounded-full p-0.5")}>
        <Skeleton className="w-20 h-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn(with2XB && "border rounded-full p-0.5")}>
      <div
        className={cn(
          "relative isolate flex h-8 rounded-full p-1 ring-1 ring-border",
          variant === "card" && "bg-accent",
          variant === "default" && "bg-background",
          className
        )}
      >
        {themes.map(({ key, icon: Icon, label }) => {
          const isActive = theme === key;
          return (
            <button
              aria-label={label}
              className="relative h-6 w-6 rounded-full"
              key={key}
              onClick={() => handleThemeClick(key as Theme)}
              type="button"
            >
              {isActive && (
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-full", {
                      "bg-primary": variant === "card" && isActive,
                      "bg-accent": variant === "default" && isActive
                    }
                  )}
                  layoutId="activeTheme"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}

              <Icon
                className={cn(
                  "relative z-10 m-auto h-4 w-4", {
                    "text-primary-foreground dark:text-white": variant === "card" && isActive,
                    "text-muted-foreground": variant === "card" && !isActive
                  }
                  // isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};