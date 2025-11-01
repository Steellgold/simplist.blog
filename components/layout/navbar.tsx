"use client";

import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/layout/navbar-user-dropdown";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { SimplistIcon } from "@/components/icon";

export const AppNavbar = () => {
  const { data, isPending } = authClient.useSession();
  const hasScrolled = useScrollTop(150);

  return (
    <header className={cn("sticky top-0 z-50 w-full backdrop-blur-sm", {
      "bg-background/20": hasScrolled,
    })}>
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <SimplistIcon />

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
            </nav>

            {!isPending && data ? (
              <UserDropdown user={data.user} />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
