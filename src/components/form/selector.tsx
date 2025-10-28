"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type optionType = { id: string; label: string };

type IdSelectProps = {
  options: optionType[];
  value: string | "all" | undefined;
  onChange: (id: string | "all") => void;
  includeAll?: boolean;
  allLabel?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
};

export default function Selected({
  options,
  value,
  onChange,
  includeAll = true,
  allLabel = "All",
  placeholder = "Select...",
  className,
  triggerClassName,
  disabled = false,
}: IdSelectProps) {
  // Force value to a string for Select
  const currentValue = value ?? (includeAll ? "all" : "");
  const t = useTranslations();
  return (
    <div className={className}>
      <Select
        value={currentValue}
        onValueChange={(v) => onChange(v as "all" | string)}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-[200px]", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem disabled value={"__CLEAR__"}>
            {t("Common.emptyOption")}
          </SelectItem>
          {includeAll && <SelectItem value="all">{allLabel}</SelectItem>}
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
