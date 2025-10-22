"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Clock, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ArticleSchedulePickerProps = {
  scheduledPublishAt: Date | null;
  onScheduleChange: (date: Date | null) => void;
  projectTimezone: string;
  disabled?: boolean;
};

export const ArticleSchedulePicker = ({
  scheduledPublishAt,
  onScheduleChange,
  projectTimezone,
  disabled = false,
}: ArticleSchedulePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(
    scheduledPublishAt ? new Date(scheduledPublishAt) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    scheduledPublishAt
      ? format(new Date(scheduledPublishAt), "HH:mm")
      : null
  );

  // Generate time slots every 30 minutes
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const displayTime = format(new Date(`2000-01-01T${timeString}`), "h:mm a");
        slots.push({ value: timeString, display: displayTime });
      }
    }
    return slots;
  };

  const availableTimes = generateTimeSlots();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const scheduledDate = new Date(selectedDate);
        scheduledDate.setHours(hours, minutes, 0, 0);
        onScheduleChange(scheduledDate);
      }
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (date) {
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledDate = new Date(date);
      scheduledDate.setHours(hours, minutes, 0, 0);
      onScheduleChange(scheduledDate);
    }
  };

  const handleClearSchedule = () => {
    setDate(undefined);
    setSelectedTime(null);
    onScheduleChange(null);
  };

  const formatScheduledDate = (date: Date) => {
    return format(date, "PPP 'at' p", { locale: fr });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Schedule Publication</Label>
        {scheduledPublishAt && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearSchedule}
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {scheduledPublishAt ? (
        <div className="p-3 bg-muted rounded-md">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Scheduled for {formatScheduledDate(scheduledPublishAt)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Timezone: {projectTimezone}
          </div>
        </div>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={disabled} className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Choose Date & Time
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]" suppressHydrationWarning>
            <DialogHeader>
              <DialogTitle>Schedule Publication</DialogTitle>
            </DialogHeader>
            <div className="flex divide-x overflow-hidden rounded-md border bg-background">
              <Calendar
                mode="single"
                onSelect={handleDateSelect}
                selected={date}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
              <div className="relative w-[249px] overflow-hidden">
                <div className="absolute inset-0 grid gap-4">
                  <div className="space-y-2 px-4 pt-4">
                    <p className="text-center font-medium text-sm">
                      Available Times
                    </p>
                  </div>
                  <ScrollArea className="h-full overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2 px-4 pb-4">
                      {availableTimes.map((time) => (
                        <Button
                          key={time.value}
                          onClick={() => handleTimeSelect(time.value)}
                          size="sm"
                          variant={selectedTime === time.value ? "default" : "outline"}
                        >
                          {time.display}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Timezone: {projectTimezone}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
