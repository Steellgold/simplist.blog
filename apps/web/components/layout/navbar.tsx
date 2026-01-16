"use client";

import { SimplistIcon, SimplistIconThemed } from "@/components/simplist-icon";
import { buttonVariants } from "@simplist/ui/components/button";
import { Bars, Xmark } from "@gravity-ui/icons";
import Link from "next/link";
import { FC, useState } from "react";
import { cn } from "@simplist/ui/lib/utils";

type NavbarProps = {
  /**
   * When true, the navbar sticks to the top on scroll.
   * When false (e.g. on /legal/*), it is rendered as a regular header.
   */
  sticky?: boolean;
};

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  {
    href: "https://docs.simplist.blog",
    label: "Documentation",
    external: true,
  },
  // {
  //   href: "/posts",
  //   label: "Posts",
  //   external: false
  // }
];

export const Navbar: FC<NavbarProps> = ({ sticky = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const positionClasses = sticky ? "sticky top-0" : "relative";

  return (
    <header className={`${positionClasses} z-50 w-full px-4 py-3`}>
      {/* Navbar flottante avec glassmorphism */}
      <nav
        className={cn(
          "mx-auto max-w-4xl",
          "rounded-2xl border border-white/10",
          "dark:bg-background/35 bg-black/5 backdrop-blur-xl",
        )}
      >
        <div className="flex h-14 items-center justify-between px-5">
          {/* Logo - gauche */}
          <SimplistIconThemed />

          {/* Liens + CTA - droite */}
          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "hidden sm:inline-flex",
              )}
              href="https://app.simplist.blog/auth/login"
              target="_blank"
            >
              Get Started
            </Link>

            {/* Hamburger button (mobile) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors md:hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <Xmark className="size-5" />
              ) : (
                <Bars className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out md:hidden",
            isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-muted-foreground hover:text-foreground py-2 text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "mt-2 w-full justify-center sm:hidden",
                )}
                href="https://app.simplist.blog/auth/login"
                target="_blank"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
