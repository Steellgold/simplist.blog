"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, BarChart3 } from "lucide-react";

interface UsageCardProps {
  usage: {
    articles: {
      current: number;
      limit: number;
    };
    storage: {
      current: number;
      limit: number;
    };
    apiKeys: {
      current: number;
      limit: number;
    };
    apiCalls: {
      current: number;
      limit: number;
      resetDate: Date;
    };
  };
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 75) return "bg-yellow-500";
  return "bg-primary";
};

export const UsageCard = ({ usage }: UsageCardProps) => {
  const articlePercentage = (usage.articles.current / usage.articles.limit) * 100;
  const storagePercentage = (usage.storage.current / usage.storage.limit) * 100;
  const apiKeyPercentage = (usage.apiKeys.current / usage.apiKeys.limit) * 100;
  const apiCallPercentage = (usage.apiCalls.current / usage.apiCalls.limit) * 100;

  const isArticleLimitWarning = articlePercentage >= 75;
  const isStorageLimitWarning = storagePercentage >= 75;
  const isApiCallLimitWarning = apiCallPercentage >= 75;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Usage</CardTitle>
        </div>
        <CardDescription>Monitor your current usage and limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Articles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Articles</span>
            <span className="text-muted-foreground">
              {usage.articles.current} / {usage.articles.limit === Infinity ? "∞" : usage.articles.limit}
            </span>
          </div>
          {usage.articles.limit !== Infinity && (
            <>
              <Progress
                value={articlePercentage}
                className="h-2"
                indicatorClassName={getProgressColor(articlePercentage)}
              />
              {isArticleLimitWarning && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Approaching limit</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Storage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Storage</span>
            <span className="text-muted-foreground">
              {formatBytes(usage.storage.current)} / {formatBytes(usage.storage.limit)}
            </span>
          </div>

          <Progress
            value={storagePercentage}
            className="h-2"
            indicatorClassName={getProgressColor(storagePercentage)}
          />
          {isStorageLimitWarning && (
            <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="h-3 w-3" />
              <span>Approaching limit</span>
            </div>
          )}
        </div>

        {/* API Keys */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">API Keys</span>
            <span className="text-muted-foreground">
              {usage.apiKeys.current} / {usage.apiKeys.limit}
            </span>
          </div>
          <Progress
            value={apiKeyPercentage}
            className="h-2"
            indicatorClassName={getProgressColor(apiKeyPercentage)}
          />
        </div>

        {/* API Calls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">API Calls (Monthly)</span>
            <span className="text-muted-foreground">
              {formatNumber(usage.apiCalls.current)} / {formatNumber(usage.apiCalls.limit)}
            </span>
          </div>
          <Progress
            value={apiCallPercentage}
            className="h-2"
            indicatorClassName={getProgressColor(apiCallPercentage)}
          />
          {isApiCallLimitWarning && (
            <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="h-3 w-3" />
              <span>Approaching limit</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Resets on{" "}
            {new Date(
              usage.apiCalls.resetDate.getTime() + 30 * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
