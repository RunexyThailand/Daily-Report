"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import Selected, { type optionType } from "@/components/form/Selected";

type ReportFilterProps = {
  projects: optionType[];
  tasks: optionType[];
  users: optionType[];
};

function getDateFromParam(v?: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(+d) ? undefined : d;
}

export default function ReportFilter({
  projects,
  tasks,
  users,
}: ReportFilterProps) {
  // const router = useRouter();
  // const pathname = usePathname();
  const sp = useSearchParams();

  // init from URL
  const initialRange: DateRange | undefined = {
    from: getDateFromParam(sp.get("from")),
    to: getDateFromParam(sp.get("to")),
  };

  const [range, setRange] = React.useState<DateRange | undefined>(initialRange);
  const [projectSelected, setProjectSelected] = React.useState<string>("all");
  const [taskSelected, setTaskSelected] = React.useState<string>("all");
  const [userSelected, setUserSelected] = React.useState<string>("all");
  const [open, setOpen] = React.useState(false);

  const hasDate = !!(range?.from || range?.to);
  // const hasSelected = selected !== "all";

  function apply() {
    // const qs = new URLSearchParams(sp.toString());
    // if (range?.from) qs.set("from", range.from.toISOString().slice(0, 10));
    // else qs.delete("from");
    // if (range?.to) qs.set("to", range.to.toISOString().slice(0, 10));
    // else qs.delete("to");
    // if (selected && selected !== "all") qs.set("selected", selected);
    // else qs.delete("selected");
    // router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
    setOpen(false);
  }

  function reset() {
    // const qs = new URLSearchParams(sp.toString());
    // ["from", "to", "selected"].forEach((k) => qs.delete(k));
    // router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
    setRange(undefined);
    setProjectSelected("all");
    setTaskSelected("all");
    setUserSelected("all");
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
          />
          <div className="mt-3 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRange(undefined)}>
              Clear
            </Button>
            <Button onClick={apply}>Apply</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Selected
        options={projects}
        value={projectSelected}
        onChange={(id) => {
          setProjectSelected(id);
        }}
        includeAll
        allLabel="All projects"
        placeholder="All projects"
        triggerClassName="w-[200px]"
      />

      <Selected
        options={tasks}
        value={taskSelected}
        onChange={(id) => {
          setTaskSelected(id);
        }}
        includeAll
        allLabel="All tasks"
        placeholder="All tasks"
        triggerClassName="w-[200px]"
      />

      <Selected
        options={users}
        value={userSelected}
        onChange={(id) => {
          setUserSelected(id);
        }}
        includeAll
        allLabel="Everyone"
        placeholder="Everyone"
        triggerClassName="w-[200px]"
      />

      <Button onClick={apply}>Filter</Button>
      <Button variant="ghost" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}
