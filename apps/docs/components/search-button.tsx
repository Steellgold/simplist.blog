"use client";

import { useSearchCommand } from "@/hooks/use-search-command";
import { Kbd, KbdGroup } from "@simplist/ui/components/kbd";
import { SidebarMenuButton, useSidebar } from "@simplist/ui/components/sidebar";
import { cn } from "@simplist/ui/lib/utils";
import { Search } from "lucide-react";

export const SearchButton = () => {
  const { toggle } = useSearchCommand();
  const { state } = useSidebar();

  if (state === "collapsed") {
    return (
      <SidebarMenuButton onClick={toggle} className="justify-center border">
        <Search />
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton
      variant="outline"
      className={cn("relative w-full justify-start")}
      onClick={toggle}
    >
      <Search />
      <span className="truncate">Search...</span>

      <KbdGroup className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2">
        <Kbd>CTRL</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </SidebarMenuButton>
  );
};
