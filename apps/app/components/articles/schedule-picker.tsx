"use client";

import { getDateFnsLocale, LanguageCode } from "@/lib/types/languages";
import { Button } from "@simplist/ui/components/button";
import { Calendar } from "@simplist/ui/components/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@simplist/ui/components/dialog";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@simplist/ui/components/item";
import { ScrollArea } from "@simplist/ui/components/scroll-area";
import { format } from "date-fns";
import { Clock, X } from "lucide-react";
import { useState } from "react";

type ArticleSchedulePickerProps = {
  scheduledPublishAt: Date | null;
  onScheduleChange: (date: Date | null) => void;
  projectTimezone: string;
  projectDefaultLanguage: LanguageCode;
  disabled?: boolean;
};

export const ArticleSchedulePicker = ({
  scheduledPublishAt,
  onScheduleChange,
  projectTimezone,
  projectDefaultLanguage,
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
    const now = new Date();
    const isToday = date && date.toDateString() === now.toDateString();
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        
        // If it's today, filter out past times
        if (isToday) {
          const testDate = new Date(date);
          testDate.setHours(hour, minute, 0, 0);
          if (testDate <= now) {
            continue; // Skip past times for today
          }
        }
        
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
        
        // Validate that the scheduled date is in the future
        const now = new Date();
        if (scheduledDate <= now) {
          // If the selected time is in the past, don't update the schedule
          return;
        }
        
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
      
      // Validate that the scheduled date is in the future
      const now = new Date();
      if (scheduledDate <= now) {
        // If the selected time is in the past, don't update the schedule
        return;
      }
      
      onScheduleChange(scheduledDate);
    }
  };

  const handleClearSchedule = () => {
    setDate(undefined);
    setSelectedTime(null);
    onScheduleChange(null);
  };

  return (
    <div className="space-y-4">
      {scheduledPublishAt ? (
        <Item variant="muted" className="relative">
          <ItemContent>
            <ItemTitle>Scheduled</ItemTitle>
            <ItemDescription>
              {format(new Date(scheduledPublishAt), "PPP 'at' HH:mm", { locale: getDateFnsLocale(projectDefaultLanguage) })}
              <br />
              Timezone: {projectTimezone}
            </ItemDescription>

            <Button size="sm" variant="secondary" onClick={handleClearSchedule} disabled={disabled} className="absolute top-2 right-2 border">
              <X />
              Clear
            </Button>
          </ItemContent>
        </Item>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={disabled} className="w-full">
              <Clock />
              Choose a time
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
