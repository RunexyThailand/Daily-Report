"use client";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const SIZES = [
  "12px",
  "13px",
  "14px",
  "15px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "48px",
] as const;

type FontSizeSelectProps = {
  current: string;
  onChange: (value: string) => void;
};

export function FontSizeSelect({ current, onChange }: FontSizeSelectProps) {
  const [fontSize, setFontSize] = useState(current || "14px");

  const fontSizeChange = (size: string): void => {
    setFontSize(size);
    onChange(size);
  };

  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <Select value={fontSize} onValueChange={fontSizeChange}>
        <SelectTrigger
          className="w-20 bg-white rounded-8 cursor-pointer"
          aria-label="Font size"
        >
          <SelectValue placeholder="เลือกขนาด…" />
        </SelectTrigger>
        <SelectContent className="rounded-8">
          {SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
