 "use client";

import { SimplistIcon } from "@/components/simplist-icon";
import { buttonVariants } from "@simplist/ui/components/button";
import Link from "next/link";
import { FC } from "react";

type NavbarProps = {
  /**
   * When true, the navbar sticks to the top on scroll.
   * When false (e.g. on /legal/*), it is rendered as a regular header.
   */
  sticky?: boolean;
};

export const Navbar: FC<NavbarProps> = ({ sticky = true }) => {
  const positionClasses = sticky ? "sticky top-0" : "relative";

  return (
    <header className={`${positionClasses} py-1 z-50 w-full backdrop-blur-sm bg-background/20`}>
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <SimplistIcon />

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>

              <Link
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>

              <Link
                href="#docs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </Link>
            </nav>

            <Link
              className={buttonVariants({ variant: "default", size: "sm" })}
              href="https://app.simplist.blog/auth/login"
              target="_blank"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
