"use client";

import { AutoSaveStatus } from "@/hooks/use-auto-save";
import { useProject } from "@/hooks/use-project-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { LanguageCode } from "@/lib/types/languages";
import { CircleCheck, Xmark } from "@gravity-ui/icons";
import { Button, buttonVariants } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { Label } from "@simplist/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplist/ui/components/select";
import { Spinner } from "@simplist/ui/components/spinner";
import Image from "next/image";
import Link from "next/link";
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
  projectDefaultLanguage?: LanguageCode;
  projectId?: string;
  autoSaveStatus?: AutoSaveStatus;
  lastAutoSave?: Date | null;
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
  projectDefaultLanguage = "en",
  projectId,
  autoSaveStatus,
}: ArticleVisibilityCardProps) => {
  const { currentProject } = useProject();

  const { subscription } = useSubscriptionLimits(projectId);
  const isPro = subscription?.tier === "PRO";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility</CardTitle>
        <CardDescription>Select the visibility of the article.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => onStatusChange(v as ArticleStatus)}
          >
            <SelectTrigger
              id="status"
              className="w-full"
              suppressHydrationWarning
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent side="bottom" align="start" suppressHydrationWarning>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>

              <SelectItem value="scheduled" disabled={!isPro}>
                Scheduled
                {!isPro && (
                  <span className="absolute right-2 flex size-3.5 items-center justify-center">
                    <Image
                      src="https://cdn.simplist.blog/assets/billing/mini-pro-badge.png"
                      alt="PRO"
                      width={16}
                      height={16}
                    />
                  </span>
                )}
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
            projectDefaultLanguage={projectDefaultLanguage}
          />
        )}

        <div className="flex items-center justify-between pt-2">
          {leftAction || (
            <Link
              href={`/${currentProject?.slug}/articles`}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <Xmark />
              Cancel
            </Link>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || autoSaveStatus !== "idle"}
          >
            {autoSaveStatus === "saving" && (
              <>
                <Spinner />
                Auto-saving...
              </>
            )}

            {autoSaveStatus === "saved" && (
              <>
                <CircleCheck />
                Auto-saved
              </>
            )}

            {autoSaveStatus === "error" && (
              <>
                <Xmark />
                Error auto-saving
              </>
            )}

            {!autoSaveStatus || (autoSaveStatus === "idle" && submitLabel)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
