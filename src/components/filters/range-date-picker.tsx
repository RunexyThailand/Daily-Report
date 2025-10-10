"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format as dfFormat } from "date-fns";
import type { Locale } from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export type RangeDatePickerProps = {
  /** Controlled range value */
  value?: DateRange;
  /** Callback when user confirms (Apply) or clears */
  onChange: (range: DateRange | undefined) => void;

  /** date-fns locale, e.g. ja, enUS */
  locale?: Locale;
  /** Format for trigger text */
  formatString?: string; // default: "yyyy-MM-dd"

  /** i18n labels (fallbacks provided) */
  labels?: {
    selectDateLabel?: string; // default: "Select date range"
    clear?: string; // default: "Clear"
    apply?: string; // default: "Apply"
  };

  /** Styling overrides */
  triggerClassName?: string;
  popoverClassName?: string;

  /** Disable the whole control */
  disabled?: boolean;

  /** Force number of months; if omitted and responsive=true → 1 on <sm, 2 on ≥sm */
  numberOfMonths?: number;
  /** Enable responsive months (default true) */
  responsive?: boolean;

  /** Popover positioning (optional) */
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

export function RangeDatePicker({
  value,
  onChange,
  locale,
  formatString = "yyyy-MM-dd",
  labels,
  triggerClassName,
  popoverClassName,
  disabled,
  numberOfMonths,
  responsive = true,
  side = "bottom",
  align = "start",
  sideOffset = 8,
}: RangeDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<DateRange | undefined>(value);

  const isSmall = useMediaQuery("(max-width: 639px)");
  const months =
    typeof numberOfMonths === "number"
      ? numberOfMonths
      : responsive
        ? isSmall
          ? 1
          : 2
        : 2;

  const hasDate = !!(value?.from || value?.to);

  const L = {
    selectDateLabel: labels?.selectDateLabel ?? "Select date range",
    clear: labels?.clear ?? "Clear",
    apply: labels?.apply ?? "Apply",
  };

  React.useEffect(() => {
    if (!open) setPending(value);
  }, [value, open]);

  const handleApply = () => {
    onChange(pending);
    setOpen(false);
  };

  const handleClear = () => {
    setPending(undefined);
    onChange(undefined);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setPending(value);
        }
        setOpen(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn(
            "justify-start w-full sm:w-[200px]",
            hasDate && "border-primary",
            triggerClassName,
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {hasDate ? (
            <span className="truncate">
              {value?.from ? dfFormat(value.from, formatString) : "…"} —{" "}
              {value?.to ? dfFormat(value.to, formatString) : "…"}
            </span>
          ) : (
            <span data-testid="pickDate" className="text-muted-foreground">
              {L.selectDateLabel}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn("p-3 w-full", popoverClassName)}
      >
        <Calendar
          mode="range"
          numberOfMonths={months}
          selected={pending}
          locale={locale}
          onSelect={setPending}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClear}>
            {L.clear}
          </Button>
          <Button onClick={handleApply}>{L.apply}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
