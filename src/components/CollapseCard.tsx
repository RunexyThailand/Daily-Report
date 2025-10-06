"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

type CollapseCardProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function CollapseCard({
  title,
  description,
  children,
  defaultOpen,
  open,
  onOpenChange,
  actions,
  className,
  contentClassName,
}: CollapseCardProps) {
  const [internalOpen, setInternalOpen] = React.useState(!!defaultOpen);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? (open as boolean) : internalOpen;

  const handleChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleChange}
      className={cn("w-full ", className)}
    >
      <Card className="overflow-hidden p-0">
        <CardHeader className="p-0 gap-0 bg-[#f4fafd]">
          <CollapsibleTrigger asChild>
            <div
              className={cn(
                "flex w-full cursor-pointer select-none items-center gap-3 px-4 py-3",
                "hover:bg-accent/60 transition-colors",
              )}
            >
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base truncate">{title}</CardTitle>
                {description ? (
                  <CardDescription className="truncate">
                    {description}
                  </CardDescription>
                ) : null}
              </div>
              {actions ? (
                <div
                  data-no-toggle
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-2"
                >
                  {actions}
                </div>
              ) : null}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className={cn("pt-0", contentClassName)}>
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
