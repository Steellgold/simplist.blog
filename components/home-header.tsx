"use client";

import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/user-dropdown";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface HomeHeaderProps {
  user: User | null;
}

export const HomeHeader = ({ user }: HomeHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="https://cdn.simplist.blog/assets/simplist-text-icon.svg"
              alt="Simplist"
              width={120}
              height={24}
              className="h-6 w-auto dark:invert"
              priority
            />
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
            </nav>

            {user ? (
              <UserDropdown user={user} />
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
