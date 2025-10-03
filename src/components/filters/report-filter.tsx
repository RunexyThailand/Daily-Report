"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

type ProjectDTO = { id: string; name: string };

function getDateFromParam(v?: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(+d) ? undefined : d;
}

export default function ReportFilter({ projects }: { projects: ProjectDTO[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // init from URL
  const initialRange: DateRange | undefined = {
    from: getDateFromParam(sp.get("from")),
    to: getDateFromParam(sp.get("to")),
  };

  const [range, setRange] = React.useState<DateRange | undefined>(initialRange);
  const [selected, setSelected] = React.useState<string>(
    sp.get("selected") ?? "all",
  );
  const [open, setOpen] = React.useState(false);

  const hasDate = !!(range?.from || range?.to);
  const hasSelected = selected !== "all";

  function apply() {
    const qs = new URLSearchParams(sp.toString());
    if (range?.from) qs.set("from", range.from.toISOString().slice(0, 10));
    else qs.delete("from");
    if (range?.to) qs.set("to", range.to.toISOString().slice(0, 10));
    else qs.delete("to");
    if (selected && selected !== "all") qs.set("selected", selected);
    else qs.delete("selected");
    router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
    setOpen(false);
  }

  function reset() {
    const qs = new URLSearchParams(sp.toString());
    ["from", "to", "selected"].forEach((k) => qs.delete(k));
    router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
    setRange(undefined);
    setSelected("all");
    setOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date Range */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start gap-2 min-w-[220px]",
              hasDate && "border-primary",
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {hasDate ? (
              <span className="truncate">
                {range?.from ? format(range.from, "yyyy-MM-dd") : "…"} —{" "}
                {range?.to ? format(range.to, "yyyy-MM-dd") : "…"}
              </span>
            ) : (
              <span className="text-muted-foreground">Pick date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-3 w-auto" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={setRange}
            initialFocus
          />
          <div className="mt-3 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRange(undefined)}>
              Clear
            </Button>
            <Button onClick={apply}>Apply</Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected filter */}
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {projects.map((item: ProjectDTO) => (
            <SelectItem value={item.id}>{item.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={"allTask"} onValueChange={() => {}}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="allTask">All Task </SelectItem>
          <SelectItem value="taks1">Taks1</SelectItem>
          <SelectItem value="taks2">Taks2</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={apply}>Filter</Button>
      <Button variant="ghost" onClick={reset}>
        Reset
      </Button>

      {/* Active chips */}
      {(hasDate || hasSelected) && (
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <div className="flex items-center gap-2">
            {hasDate && (
              <Badge variant="secondary" className="gap-2">
                {range?.from ? format(range.from, "yyyy-MM-dd") : "…"} —{" "}
                {range?.to ? format(range.to, "yyyy-MM-dd") : "…"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setRange(undefined)}
                />
              </Badge>
            )}
            {hasSelected && (
              <Badge variant="secondary" className="gap-2">
                {selected !== "all"
                  ? (projects.find((p) => p.id === selected)?.name ??
                    "Unknown project")
                  : "Not selected"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelected("all")}
                />
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}
