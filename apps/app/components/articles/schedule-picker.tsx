"use client";

import { formatTime24to12, getDateFnsLocale, getLanguage, LanguageCode } from "@/lib/types/languages";
import { Button } from "@simplist/ui/components/button";
import { Calendar } from "@simplist/ui/components/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@simplist/ui/components/dialog";
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
  scheduledPublishAt, onScheduleChange,
  projectTimezone, projectDefaultLanguage,
  disabled = false,
}: ArticleSchedulePickerProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    scheduledPublishAt ? new Date(scheduledPublishAt) : new Date()
  );

  const [selectedTime, setSelectedTime] = useState<string | null>(
    scheduledPublishAt
      ? format(new Date(scheduledPublishAt), "HH:mm")
      : null
  );

  const now = new Date();
  const isToday = date && date.toDateString() === now.toDateString();

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const totalMinutes = i * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }).filter((time) => {
    if (isToday) {
      const [hours, minutes] = time.split(":").map(Number);
      const testDate = new Date(date);
      testDate.setHours(hours, minutes, 0, 0);
      return testDate > now;
    }
    return true;
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);

      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const scheduledDate = new Date(selectedDate);
        scheduledDate.setHours(hours, minutes, 0, 0);

        if (scheduledDate <= now) setSelectedTime(null);
      }
    }
  };

  const handleConfirm = () => {
    if (date && selectedTime) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDate = new Date(date);
      scheduledDate.setHours(hours, minutes, 0, 0);
      onScheduleChange(scheduledDate);
      setOpen(false);
    }
  };

  const handleClearSchedule = () => {
    setDate(new Date());
    setSelectedTime(null);
    onScheduleChange(null);
  };

  const locale = getDateFnsLocale(projectDefaultLanguage);
  const is12Hour = getLanguage(projectDefaultLanguage)?.uses12HourFormat;
  const isScheduleComplete = date && selectedTime;

  return (
    <div className="space-y-4">
      {scheduledPublishAt ? (
        <Item variant="muted" className="relative">
          <ItemContent>
            <ItemTitle>Scheduled</ItemTitle>
            <ItemDescription>
              {format(new Date(scheduledPublishAt), is12Hour ? "PPP 'at' h:mm a" : "PPP 'at' HH:mm", { locale })}
              <br />
              Timezone: {projectTimezone}
            </ItemDescription>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleClearSchedule}
              disabled={disabled}
              className="absolute top-2 right-2 border"
            >
              <X />
              Clear
            </Button>
          </ItemContent>
        </Item>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={disabled} className="w-full">
              <Clock />
              Choose a time
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] p-0 gap-0" suppressHydrationWarning>
            <DialogHeader className="flex h-max justify-center border-b p-4">
              <DialogTitle>Schedule Publication</DialogTitle>
            </DialogHeader>

            <div className="relative md:pr-48">
              <div className="p-4 w-full">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  defaultMonth={date}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  showOutsideDays={false}
                  className="w-full bg-transparent p-0"
                />
              </div>

              <div className="inset-y-0 right-0 flex w-full flex-col gap-4 border-t max-md:h-60 md:absolute md:w-48 md:border-t-0 md:border-l">
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-2 p-4">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className="w-full shadow-none"
                        disabled={disabled}
                        size="sm"
                      >
                        {is12Hour ? formatTime24to12(time) : time}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Timezone: {projectTimezone}
              </div>

              <Button
                onClick={handleConfirm}
                disabled={!isScheduleComplete || disabled}
                size="sm"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
