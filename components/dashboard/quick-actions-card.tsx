"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressButton } from "@/components/ui/progress-button";
import { FileText, Key, LineChart, Settings } from "lucide-react";

interface QuickActionsCardProps {
  projectSlug: string;
  articlesUsed: number;
  articlesLimit: number;
  apiKeysUsed: number;
  apiKeysLimit: number;
}

export const QuickActionsCard = ({
  projectSlug,
  articlesUsed,
  articlesLimit,
  apiKeysUsed,
  apiKeysLimit,
}: QuickActionsCardProps) => {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProgressButton
          variant="default"
          className="w-full justify-start"
          onClick={() => router.push(`/${projectSlug}/articles/new`)}
          value={articlesUsed}
          max={articlesLimit}
        >
          <FileText />
          New Article
          {articlesLimit !== -1 && (
            <span className="ml-auto text-xs opacity-70">
              {articlesUsed}/{articlesLimit}
            </span>
          )}
        </ProgressButton>

        <ProgressButton
          variant="outline"
          className="w-full justify-start"
          onClick={() => router.push(`/${projectSlug}/api-keys`)}
          value={apiKeysUsed}
          max={apiKeysLimit}
        >
          <Key />
          Create API Key
          {apiKeysLimit !== -1 && (
            <span className="ml-auto text-xs opacity-70">
              {apiKeysUsed}/{apiKeysLimit}
            </span>
          )}
        </ProgressButton>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => router.push(`/${projectSlug}/analytics`)}
        >
          <LineChart />
          View Analytics
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => router.push(`/${projectSlug}/settings`)}
        >
          <Settings />
          Project Settings
        </Button>
      </CardContent>
    </Card>
  );
};
