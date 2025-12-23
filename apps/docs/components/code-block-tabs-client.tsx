"use client";

import { languages } from "@/lib/languages";
import { cn } from "@/lib/utils";
import { Card } from "@simplist/ui/components/card";
import { CopyButton } from "@simplist/ui/components/copy-button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@simplist/ui/components/tabs";
import { FC, useState } from "react";

type HighlightedTab = {
  label: string;
  language: string;
  code: string;
  filename?: string;
  highlighted: string;
  cusLang?: string;
};

type CodeBlockTabsClientProps = {
  tabs: HighlightedTab[];
  className?: string;
  cusLang?: string;
};

export const CodeBlockTabsClient: FC<CodeBlockTabsClientProps> = ({
  tabs,
  className,
  cusLang,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0].label);
  const activeTabData = tabs.find((t) => t.label === activeTab) || tabs[0];

  return (
    <Card className="rounded-2xl p-[2.5px]">
      <Card className={cn("max-w-full overflow-hidden p-0", className)}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue={tabs[0].label}
        >
          <div className="bg-muted/50 flex min-w-0 items-center justify-between gap-2 border-b px-2 py-2">
            <TabsList className="min-w-0 shrink overflow-x-auto bg-transparent">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.label}
                  value={tab.label}
                  className="shrink-0"
                  title={tab.filename || tab.label}
                >
                  {tab.cusLang
                    ? languages.find((l) => l.value === tab.cusLang)?.icon
                    : languages.find((l) => l.value === tab.language)?.icon}
                  <span className="inline-block align-middle">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex min-w-0 shrink-0 items-center gap-2">
              <CopyButton content={activeTabData.code} />
            </div>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.label} value={tab.label} className="-mt-2.5">
              <div className="max-w-full overflow-x-auto">
                <div
                  className="[&_pre]:m-0 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:bg-transparent [&_pre]:p-4"
                  dangerouslySetInnerHTML={{ __html: tab.highlighted }}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </Card>
  );
};
