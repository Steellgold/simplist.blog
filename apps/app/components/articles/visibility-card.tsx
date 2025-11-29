"use client";

import { useApiKeyLimits } from "@/hooks/use-subscription-limits";
import { Button } from "@simplist/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card";
import { Label } from "@simplist/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@simplist/ui/components/select";
import { Spinner } from "@simplist/ui/components/spinner";
import Image from "next/image";
import { ReactNode } from "react";
import { ArticleSchedulePicker } from "./schedule-picker";

type ArticleStatus = "draft" | "published" | "scheduled";

type ArticleVisibilityCardProps = {
  status: ArticleStatus;
  onStatusChange: (value: ArticleStatus) => void;
  isSubmitting: boolean;
  submitLabel: string;
  leftAction?: ReactNode; // e.g., Delete or Cancel Link/Button
  scheduledPublishAt?: Date | null;
  onScheduleChange?: (date: Date | null) => void;
  projectTimezone?: string;
  projectId?: string;
};

export const ArticleVisibilityCard = ({ 
  status, 
  onStatusChange, 
  isSubmitting, 
  submitLabel, 
  leftAction,
  scheduledPublishAt,
  onScheduleChange,
  projectTimezone = "UTC",
  projectId
}: ArticleVisibilityCardProps) => {
  const { tier } = useApiKeyLimits(projectId);
  const isPro = tier === "PRO";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility</CardTitle>
        <CardDescription>
          Do you want to publish, draft, or schedule this post?
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as ArticleStatus)}>
            <SelectTrigger id="status" className="w-full" suppressHydrationWarning>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom" align="start" suppressHydrationWarning>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled" disabled={!isPro}>
                <div className="flex items-center gap-2">
                  <span>Scheduled</span>
                  {!isPro && (
                    <Image
                      src="https://cdn.simplist.blog/assets/billing/mini-pro-badge.png"
                      alt="PRO"
                      width={16}
                      height={16}
                    />
                  )}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {status === "scheduled" && onScheduleChange && (
          <ArticleSchedulePicker
            scheduledPublishAt={scheduledPublishAt || null}
            onScheduleChange={onScheduleChange}
            projectTimezone={projectTimezone}
            disabled={isSubmitting}
          />
        )}

        <div className="flex items-center justify-between pt-2">
          <div>{leftAction}</div>
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? <Spinner /> : submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


