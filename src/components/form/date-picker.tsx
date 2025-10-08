"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format as dfFormat } from "date-fns";
import type { Locale } from "date-fns";
import type { Matcher } from "react-day-picker";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function today() {
  return startOfDay(new Date());
}

export type DatePickerProps = {
  /** Controlled value (nullable) */
  value: Date | null;
  /** Called when user picks or clears (may be null) */
  onChange: (value: Date | null) => void;
  /** Disable the entire trigger */
  disabled?: boolean;
  /** className for the trigger button */
  className?: string;
  /** date-fns format string (default: PPP) */
  displayFormat?: string;
  /** optional date-fns locale, e.g. import { ja } from 'date-fns/locale' */
  locale?: Locale;
  /** Pass-through to <Calendar disabled={...}> */
  dayDisabled?: Matcher | Matcher[];
  /** Called when popover open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Start open (useful for first-time hint) */
  defaultOpen?: boolean;
  /** Show a clear (x) button inside popover (sets value to null) */
  showClear?: boolean;
  /** Show a Today button (sets value to today) */
  showToday?: boolean;
  /** If true, force value to startOfDay when selecting/today (default true) */
  snapToStartOfDay?: boolean;
  /** Placeholder when value is null (default: "Pick a date") */
  placeholder?: string;
  /** Text for Clear button (default: "Clear") */
  clearText?: string;
  /** Text for Today button (default: "Today") */
  todayText?: string;
};

/**
 * Nullable DatePicker built with shadcn/ui (Popover + Calendar).
 * - value may be null
 * - Clear sets to null
 * - Optional Today button sets to today
 * - Optional snapToStartOfDay (default true)
 */
export default function DatePicker({
  value,
  onChange,
  disabled,
  className = "",
  displayFormat = "PPP",
  locale,
  dayDisabled,
  onOpenChange,
  defaultOpen,
  showClear = true,
  showToday = true,
  snapToStartOfDay = true,
  placeholder = "Pick a date",
  clearText = "Clear",
  todayText = "Today",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(!!defaultOpen);

  const label = React.useMemo(() => {
    if (!value) return placeholder;
    try {
      return dfFormat(value, displayFormat, { locale });
    } catch {
      return value.toLocaleDateString();
    }
  }, [value, displayFormat, locale, placeholder]);

  const normalize = React.useCallback(
    (d: Date) => (snapToStartOfDay ? startOfDay(d) : d),
    [snapToStartOfDay],
  );

  const handleSelect = (date?: Date) => {
    setOpen(false);
    if (date) onChange(normalize(date));
    else onChange(null);
  };

  const handleClear = () => {
    onChange(null);
  };

  const handleToday = () => {
    onChange(normalize(today()));
  };

  const isEmpty = !value;

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        onOpenChange?.(o);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={`w-full justify-between font-normal ${isEmpty ? "text-muted-foreground" : ""} ${className}`}
          disabled={disabled}
        >
          {label}
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          captionLayout="dropdown"
          onSelect={handleSelect}
          disabled={dayDisabled}
        />
        {(showClear || showToday) && (
          <div className="flex items-center justify-between gap-2 border-t p-2">
            {showClear && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleClear}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                {clearText}
              </Button>
            )}
            {showToday && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleToday}
                className="ml-auto"
              >
                {todayText}
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
