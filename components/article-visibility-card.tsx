"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ReactNode } from "react";

type ArticleStatus = "draft" | "published";

type ArticleVisibilityCardProps = {
  status: ArticleStatus;
  onStatusChange: (value: ArticleStatus) => void;
  isSubmitting: boolean;
  submitLabel: string;
  leftAction?: ReactNode; // e.g., Delete or Cancel Link/Button
};

export const ArticleVisibilityCard = ({ status, onStatusChange, isSubmitting, submitLabel, leftAction }: ArticleVisibilityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility</CardTitle>
        <CardDescription>
          Do you want to publish or draft this post?
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as ArticleStatus)}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

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


