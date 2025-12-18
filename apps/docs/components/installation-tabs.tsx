"use client";

import { FC, useState } from "react";
import { Card } from "@simplist/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@simplist/ui/components/tabs";
import { TooltipProvider } from "@simplist/ui/components/tooltip";
import { cn } from "@/lib/utils";
import {
  NPM,
  PnpmDark,
  Bun,
  Yarn,
  PnpmLight,
} from "@ridemountainpig/svgl-react";
import { IconThemed } from "@simplist/ui/components/icon-themed";
import { CopyButton } from "@simplist/ui/components/copy-button";

type PackageManagerKey = "npm" | "pnpm" | "yarn" | "bun";

type InstallationTabsProps = {
  commands?: Partial<Record<PackageManagerKey, string>>;
  packages?: string[];
  className?: string;
};

type Manager = {
  key: PackageManagerKey;
  label: string;
  icon: React.ReactNode;
};

const managers: Manager[] = [
  { key: "npm", label: "npm", icon: <NPM className="size-3" /> },
  {
    key: "pnpm",
    label: "pnpm",
    icon: (
      <IconThemed
        light={<PnpmLight className="size-3" />}
        dark={<PnpmDark className="size-3" />}
      />
    ),
  },
  { key: "yarn", label: "yarn", icon: <Yarn className="size-3" /> },
  { key: "bun", label: "bun", icon: <Bun className="size-3" /> },
];

export const InstallationTabs: FC<InstallationTabsProps> = ({
  commands,
  packages,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<PackageManagerKey>("pnpm");

  const effectivePackages = (
    packages?.length ? packages : ["@simplist.blog/sdk"]
  ).join(" ");

  // Build safe defaults and let explicit commands override them per manager.
  const resolvedCommands: Record<PackageManagerKey, string> = {
    npm: `npm install ${effectivePackages}`,
    pnpm: `pnpm add ${effectivePackages}`,
    yarn: `yarn add ${effectivePackages}`,
    bun: `bun add ${effectivePackages}`,
    ...commands,
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="p-[2.5px] rounded-2xl">
        <Card className={cn("overflow-hidden p-0 max-w-full", className)}>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as PackageManagerKey)}
            defaultValue="pnpm"
          >
            <div className="flex items-center justify-between bg-muted/50 px-2 py-2 border-b">
              <TabsList className="bg-transparent overflow-x-auto flex-shrink min-w-0">
                {managers.map((manager) => (
                  <TabsTrigger
                    key={manager.key}
                    value={manager.key}
                    className="flex-shrink-0"
                  >
                    {manager.icon}
                    {manager.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="pr-2">
                <CopyButton content={resolvedCommands[activeTab]} />
              </div>
            </div>

            {managers.map((manager) => (
              <TabsContent
                key={manager.key}
                value={manager.key}
                className="-mt-2.5"
              >
                <div className="py-3 px-4 overflow-x-auto">
                  <code className="text-sm text-foreground whitespace-nowrap">
                    {resolvedCommands[manager.key]}
                  </code>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </Card>
    </TooltipProvider>
  );
};
