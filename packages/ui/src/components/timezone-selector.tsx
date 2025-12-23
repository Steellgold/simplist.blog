"use client";

import { cn } from "@simplist/ui/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const TIMEZONES = [
  { value: "Pacific/Midway", label: "Pacific/Midway", offset: "UTC-11:00" },
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu", offset: "UTC-10:00" },
  {
    value: "America/Anchorage",
    label: "America/Anchorage",
    offset: "UTC-09:00",
  },
  {
    value: "America/Los_Angeles",
    label: "America/Los Angeles",
    offset: "UTC-08:00",
  },
  { value: "America/Tijuana", label: "America/Tijuana", offset: "UTC-08:00" },
  { value: "America/Phoenix", label: "America/Phoenix", offset: "UTC-07:00" },
  { value: "America/Denver", label: "America/Denver", offset: "UTC-07:00" },
  {
    value: "America/Chihuahua",
    label: "America/Chihuahua",
    offset: "UTC-07:00",
  },
  { value: "America/Mazatlan", label: "America/Mazatlan", offset: "UTC-07:00" },
  { value: "America/Chicago", label: "America/Chicago", offset: "UTC-06:00" },
  { value: "America/Regina", label: "America/Regina", offset: "UTC-06:00" },
  {
    value: "America/Mexico_City",
    label: "America/Mexico City",
    offset: "UTC-06:00",
  },
  {
    value: "America/Monterrey",
    label: "America/Monterrey",
    offset: "UTC-06:00",
  },
  {
    value: "America/Guatemala",
    label: "America/Guatemala",
    offset: "UTC-06:00",
  },
  { value: "America/New_York", label: "America/New York", offset: "UTC-05:00" },
  {
    value: "America/Indiana/Indianapolis",
    label: "America/Indiana/Indianapolis",
    offset: "UTC-05:00",
  },
  { value: "America/Bogota", label: "America/Bogota", offset: "UTC-05:00" },
  { value: "America/Lima", label: "America/Lima", offset: "UTC-05:00" },
  { value: "America/Caracas", label: "America/Caracas", offset: "UTC-04:00" },
  { value: "America/Halifax", label: "America/Halifax", offset: "UTC-04:00" },
  { value: "America/Guyana", label: "America/Guyana", offset: "UTC-04:00" },
  { value: "America/La_Paz", label: "America/La Paz", offset: "UTC-04:00" },
  { value: "America/Santiago", label: "America/Santiago", offset: "UTC-04:00" },
  { value: "America/St_Johns", label: "America/St Johns", offset: "UTC-03:30" },
  {
    value: "America/Sao_Paulo",
    label: "America/Sao Paulo",
    offset: "UTC-03:00",
  },
  {
    value: "America/Argentina/Buenos_Aires",
    label: "America/Argentina/Buenos Aires",
    offset: "UTC-03:00",
  },
  { value: "America/Godthab", label: "America/Godthab", offset: "UTC-03:00" },
  {
    value: "America/Montevideo",
    label: "America/Montevideo",
    offset: "UTC-03:00",
  },
  {
    value: "Atlantic/South_Georgia",
    label: "Atlantic/South Georgia",
    offset: "UTC-02:00",
  },
  { value: "Atlantic/Azores", label: "Atlantic/Azores", offset: "UTC-01:00" },
  {
    value: "Atlantic/Cape_Verde",
    label: "Atlantic/Cape Verde",
    offset: "UTC-01:00",
  },
  { value: "Europe/London", label: "Europe/London", offset: "UTC+00:00" },
  { value: "Europe/Dublin", label: "Europe/Dublin", offset: "UTC+00:00" },
  { value: "Europe/Lisbon", label: "Europe/Lisbon", offset: "UTC+00:00" },
  {
    value: "Africa/Casablanca",
    label: "Africa/Casablanca",
    offset: "UTC+00:00",
  },
  { value: "Africa/Monrovia", label: "Africa/Monrovia", offset: "UTC+00:00" },
  { value: "UTC", label: "UTC", offset: "UTC+00:00" },
  { value: "Europe/Paris", label: "Europe/Paris", offset: "UTC+01:00" },
  { value: "Europe/Berlin", label: "Europe/Berlin", offset: "UTC+01:00" },
  { value: "Europe/Brussels", label: "Europe/Brussels", offset: "UTC+01:00" },
  { value: "Europe/Amsterdam", label: "Europe/Amsterdam", offset: "UTC+01:00" },
  { value: "Europe/Rome", label: "Europe/Rome", offset: "UTC+01:00" },
  { value: "Europe/Madrid", label: "Europe/Madrid", offset: "UTC+01:00" },
  { value: "Europe/Vienna", label: "Europe/Vienna", offset: "UTC+01:00" },
  { value: "Europe/Warsaw", label: "Europe/Warsaw", offset: "UTC+01:00" },
  { value: "Europe/Prague", label: "Europe/Prague", offset: "UTC+01:00" },
  { value: "Africa/Lagos", label: "Africa/Lagos", offset: "UTC+01:00" },
  { value: "Africa/Windhoek", label: "Africa/Windhoek", offset: "UTC+01:00" },
  { value: "Europe/Athens", label: "Europe/Athens", offset: "UTC+02:00" },
  { value: "Europe/Bucharest", label: "Europe/Bucharest", offset: "UTC+02:00" },
  { value: "Europe/Helsinki", label: "Europe/Helsinki", offset: "UTC+02:00" },
  { value: "Europe/Istanbul", label: "Europe/Istanbul", offset: "UTC+02:00" },
  { value: "Europe/Kiev", label: "Europe/Kiev", offset: "UTC+02:00" },
  { value: "Europe/Zurich", label: "Europe/Zurich", offset: "UTC+02:00" },
  { value: "Africa/Cairo", label: "Africa/Cairo", offset: "UTC+02:00" },
  {
    value: "Africa/Johannesburg",
    label: "Africa/Johannesburg",
    offset: "UTC+02:00",
  },
  { value: "Asia/Jerusalem", label: "Asia/Jerusalem", offset: "UTC+02:00" },
  { value: "Asia/Beirut", label: "Asia/Beirut", offset: "UTC+02:00" },
  { value: "Asia/Damascus", label: "Asia/Damascus", offset: "UTC+02:00" },
  { value: "Europe/Moscow", label: "Europe/Moscow", offset: "UTC+03:00" },
  { value: "Asia/Baghdad", label: "Asia/Baghdad", offset: "UTC+03:00" },
  { value: "Asia/Kuwait", label: "Asia/Kuwait", offset: "UTC+03:00" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh", offset: "UTC+03:00" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi", offset: "UTC+03:00" },
  { value: "Asia/Tehran", label: "Asia/Tehran", offset: "UTC+03:30" },
  { value: "Asia/Dubai", label: "Asia/Dubai", offset: "UTC+04:00" },
  { value: "Asia/Muscat", label: "Asia/Muscat", offset: "UTC+04:00" },
  { value: "Asia/Baku", label: "Asia/Baku", offset: "UTC+04:00" },
  { value: "Asia/Tbilisi", label: "Asia/Tbilisi", offset: "UTC+04:00" },
  { value: "Asia/Yerevan", label: "Asia/Yerevan", offset: "UTC+04:00" },
  { value: "Asia/Kabul", label: "Asia/Kabul", offset: "UTC+04:30" },
  { value: "Asia/Karachi", label: "Asia/Karachi", offset: "UTC+05:00" },
  { value: "Asia/Tashkent", label: "Asia/Tashkent", offset: "UTC+05:00" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata", offset: "UTC+05:30" },
  { value: "Asia/Colombo", label: "Asia/Colombo", offset: "UTC+05:30" },
  { value: "Asia/Kathmandu", label: "Asia/Kathmandu", offset: "UTC+05:45" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka", offset: "UTC+06:00" },
  { value: "Asia/Almaty", label: "Asia/Almaty", offset: "UTC+06:00" },
  {
    value: "Asia/Yekaterinburg",
    label: "Asia/Yekaterinburg",
    offset: "UTC+06:00",
  },
  { value: "Asia/Yangon", label: "Asia/Yangon", offset: "UTC+06:30" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok", offset: "UTC+07:00" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta", offset: "UTC+07:00" },
  { value: "Asia/Novosibirsk", label: "Asia/Novosibirsk", offset: "UTC+07:00" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai", offset: "UTC+08:00" },
  { value: "Asia/Hong_Kong", label: "Asia/Hong Kong", offset: "UTC+08:00" },
  { value: "Asia/Singapore", label: "Asia/Singapore", offset: "UTC+08:00" },
  { value: "Asia/Taipei", label: "Asia/Taipei", offset: "UTC+08:00" },
  {
    value: "Asia/Kuala_Lumpur",
    label: "Asia/Kuala Lumpur",
    offset: "UTC+08:00",
  },
  { value: "Asia/Manila", label: "Asia/Manila", offset: "UTC+08:00" },
  { value: "Australia/Perth", label: "Australia/Perth", offset: "UTC+08:00" },
  { value: "Asia/Irkutsk", label: "Asia/Irkutsk", offset: "UTC+08:00" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo", offset: "UTC+09:00" },
  { value: "Asia/Seoul", label: "Asia/Seoul", offset: "UTC+09:00" },
  { value: "Asia/Yakutsk", label: "Asia/Yakutsk", offset: "UTC+09:00" },
  {
    value: "Australia/Adelaide",
    label: "Australia/Adelaide",
    offset: "UTC+09:30",
  },
  { value: "Australia/Darwin", label: "Australia/Darwin", offset: "UTC+09:30" },
  {
    value: "Australia/Brisbane",
    label: "Australia/Brisbane",
    offset: "UTC+10:00",
  },
  { value: "Australia/Sydney", label: "Australia/Sydney", offset: "UTC+10:00" },
  {
    value: "Australia/Melbourne",
    label: "Australia/Melbourne",
    offset: "UTC+10:00",
  },
  { value: "Pacific/Guam", label: "Pacific/Guam", offset: "UTC+10:00" },
  {
    value: "Pacific/Port_Moresby",
    label: "Pacific/Port Moresby",
    offset: "UTC+10:00",
  },
  { value: "Asia/Vladivostok", label: "Asia/Vladivostok", offset: "UTC+10:00" },
  { value: "Asia/Magadan", label: "Asia/Magadan", offset: "UTC+11:00" },
  { value: "Pacific/Noumea", label: "Pacific/Noumea", offset: "UTC+11:00" },
  { value: "Pacific/Fiji", label: "Pacific/Fiji", offset: "UTC+12:00" },
  { value: "Asia/Kamchatka", label: "Asia/Kamchatka", offset: "UTC+12:00" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland", offset: "UTC+12:00" },
  {
    value: "Pacific/Tongatapu",
    label: "Pacific/Tongatapu",
    offset: "UTC+13:00",
  },
  { value: "Pacific/Apia", label: "Pacific/Apia", offset: "UTC+13:00" },
  {
    value: "Pacific/Kiritimati",
    label: "Pacific/Kiritimati",
    offset: "UTC+14:00",
  },
];

export type Timezone = (typeof TIMEZONES)[number]["value"];

interface TimezoneComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

export function TimezoneCombobox({
  value: controlledValue,
  onValueChange,
  defaultValue = "Europe/Zurich",
}: TimezoneComboboxProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;

    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }

    onValueChange?.(newValue);
    setOpen(false);
  };

  const selectedTimezone = TIMEZONES.find((tz) => tz.value === value);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between bg-transparent"
        disabled
      >
        {selectedTimezone
          ? `${selectedTimezone.label} (${selectedTimezone.offset})`
          : "Select a timezone..."}
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          {selectedTimezone
            ? `${selectedTimezone.label} (${selectedTimezone.offset})`
            : "Select a timezone..."}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search a timezone..." />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {TIMEZONES.map((timezone) => (
                <CommandItem
                  key={timezone.value}
                  value={timezone.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === timezone.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1">{timezone.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {timezone.offset}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
