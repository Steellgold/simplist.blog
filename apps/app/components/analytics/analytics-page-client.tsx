"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnalyticsDataMultiPeriod } from "@/lib/actions/analytics";
import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import { Calendar } from "@simplist/ui/components/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter, DialogTrigger
} from "@simplist/ui/components/dialog";
import { differenceInDays, format, subDays } from "date-fns";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { AnalyticsDashboardContent } from "./dashboard";

interface AnalyticsPageClientProps {
  analyticsData: AnalyticsDataMultiPeriod;
}

export const AnalyticsPageClient = ({
  analyticsData,
}: AnalyticsPageClientProps) => {
  const isMobile = useIsMobile();
  const [selectedPeriod, setSelectedPeriod] = useQueryState(
    "days",
    parseAsInteger.withDefault(7),
  );

  const [isCustom, setIsCustom] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // Handle preset period selection
  const handlePresetSelect = (days: number) => {
    setSelectedPeriod(days);
    setIsCustom(false);
    setDateRange(undefined);
  };

  // Handle dialog open - reset temp range to current range
  const handleDialogOpen = (open: boolean) => {
    if (open) {
      setTempDateRange(dateRange);
    }
    setDialogOpen(open);
  };

  // Handle confirm button
  const handleConfirm = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      setDateRange(tempDateRange);
      const days = differenceInDays(tempDateRange.to, tempDateRange.from) + 1;
      // Map to closest available pre-loaded period
      const effectiveDays = days <= 14 ? 7 : days <= 60 ? 30 : 90;
      setSelectedPeriod(effectiveDays);
      setIsCustom(true);
      setDialogOpen(false);
    }
  };

  // Calculate display label for custom range
  const getCustomLabel = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`;
    }
    return "Custom";
  };

  // Determine if a preset is active
  const isPresetActive = (days: number) => {
    return !isCustom && selectedPeriod === days;
  };

  return (
    <PageLayout
      title="Analytics"
      description="Track visitor behavior and engagement for your articles"
      actions={
        <ButtonGroup>
          <Button
            variant={isPresetActive(7) ? "default" : "outline"}
            onClick={() => handlePresetSelect(7)}
          >
            7 days
          </Button>
          <Button
            variant={isPresetActive(30) ? "default" : "outline"}
            onClick={() => handlePresetSelect(30)}
          >
            30 days
          </Button>
          <Button
            variant={isPresetActive(90) ? "default" : "outline"}
            onClick={() => handlePresetSelect(90)}
          >
            90 days
          </Button>

          <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant={isCustom ? "default" : "outline"}
                className="gap-2"
              >
                {isCustom ? getCustomLabel() : "Custom"}
              </Button>
            </DialogTrigger>

            <DialogContent className="flex flex-col items-center" showCloseButton={false}>
              <div className={"flex justify-center w-full"}>
                <Calendar
                  mode="range"
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  numberOfMonths={isMobile ? 1 : 2}
                  disabled={{ after: new Date() }}
                  defaultMonth={subDays(new Date(), 30)}
                />
              </div>

              <DialogFooter className="w-full">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>

                <Button
                  onClick={handleConfirm}
                  disabled={!tempDateRange?.from || !tempDateRange?.to}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ButtonGroup>
      }
    >
      <AnalyticsDashboardContent
        analyticsData={analyticsData}
        selectedPeriod={selectedPeriod}
      />
    </PageLayout>
  );
};
