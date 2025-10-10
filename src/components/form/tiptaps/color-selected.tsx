"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Baseline } from "lucide-react";

function normalizeToHex(input: string | undefined, fallback = "#000000") {
  if (!input) return fallback;
  if (input.startsWith("#")) return input;
  const m = input.match(/^rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)$/i);
  if (m) {
    const to = (n: string) => Number(n).toString(16).padStart(2, "0");
    return `#${to(m[1])}${to(m[2])}${to(m[3])}`;
  }

  return fallback;
}

export const PRESETS = [
  "#000000", // Black
  "#FFFFFF", // White
  "#6B7280", // Gray-500
  "#EF4444", // Red-500
  "#F97316", // Orange-500
  "#EAB308", // Yellow-500
  "#84CC16", // Lime-500
  "#22C55E", // Green-500
  "#14B8A6", // Teal-500
  "#06B6D4", // Cyan-500
  "#3B82F6", // Blue-500
  "#6366F1", // Indigo-500
  "#8B5CF6", // Violet-500
  "#D946EF", // Fuchsia-500
  "#EC4899", // Pink-500
] as const;

export type ColorBoxPickerProps = {
  editor: Editor | null;
  fallback?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export default function ColorBoxPicker({
  editor,
  fallback = "#000000",
  onChange,
  disabled,
}: ColorBoxPickerProps) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<string>(fallback);

  const syncFromEditor = useCallback(() => {
    if (!editor) return;
    const c = editor.getAttributes("textStyle").color as string | undefined;
    setColor(normalizeToHex(c, fallback));
  }, [editor, fallback]);

  useEffect(() => {
    if (!editor) return;
    syncFromEditor();
    editor.on("selectionUpdate", syncFromEditor);
    editor.on("transaction", syncFromEditor);
    editor.on("update", syncFromEditor);
    return () => {
      editor.off("selectionUpdate", syncFromEditor);
      editor.off("transaction", syncFromEditor);
      editor.off("update", syncFromEditor);
    };
  }, [editor, syncFromEditor]);

  const apply = (value: string) => {
    setColor(value);
    editor?.chain().focus().setColor(value).run();
    onChange?.(value);
  };

  const clear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    editor?.chain().focus().unsetColor().run();
    syncFromEditor();
    onChange?.("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="relative h-9 w-8 rounded-md cursor-pointer border shadow-sm overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-white flex justify-center w-10 items-center"
          aria-label="Open color picker"
        >
          <Baseline className="bg-while" style={{ color: color }} />

          <span aria-hidden className="absolute inset-0 opacity-25" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-60" sideOffset={6}>
        <Card className="border-0 shadow-none">
          <CardContent className="p-0 space-y-3">
            <label className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">เลือกสี</span>
              <input
                type="color"
                aria-label="Choose text color"
                className="h-7 w-12 cursor-pointer border-0 bg-transparent p-0"
                value={color}
                onChange={(e) => apply(e.target.value)}
              />
            </label>

            <div className="flex flex-wrap gap-4 justify-center">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  title={p}
                  className="h-6 w-6 rounded-md border shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ backgroundColor: p }}
                  onClick={() => apply(p)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                ปิด
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => clear()}
              >
                ล้างสี
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
