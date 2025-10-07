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
import Selected, { type optionType } from "@/components/form/selected";
import { DateTime } from "luxon";
import { useLocale, useTranslations } from "next-intl";
import { ja, enUS } from "date-fns/locale";

type ReportFilterProps = {
  projects: optionType[];
  tasks: optionType[];
  users: optionType[];
  onChange?: (v: {
    taskId: string;
    projectId: string;
    userId: string;
    from: string;
    to: string;
  }) => void;
};

const TZ = "Asia/Bangkok";

function parseDateFromParam(v?: string | null): Date | undefined {
  if (!v) return undefined;
  const dt = DateTime.fromISO(v, { zone: TZ });
  return dt.isValid ? dt.toJSDate() : undefined;
}

function sameDate(a?: Date, b?: Date) {
  if (!a && !b) return true;
  if (!!a !== !!b) return false;
  return a!.getTime() === b!.getTime();
}

function formatFromToISO(range?: DateRange) {
  if (!range?.from && !range?.to) return { from: "", to: "" };

  const start = range?.from
    ? DateTime.fromJSDate(range.from, { zone: TZ }).startOf("day")
    : undefined;

  const endBase = range?.to ?? range?.from;
  const end = endBase
    ? DateTime.fromJSDate(endBase, { zone: TZ }).endOf("day")
    : undefined;

  return {
    from: start ? (start.toISO({ suppressMilliseconds: true }) ?? "") : "",
    to: end ? (end.toISO({ suppressMilliseconds: true }) ?? "") : "",
  };
}

export default function ReportFilter({
  projects,
  tasks,
  users,
  onChange,
}: ReportFilterProps) {
  const sp = useSearchParams();
  const t = useTranslations("DailyReportPage");
  const currentLang = useLocale();
  const lang = currentLang === "jp" ? ja : enUS;
  // compute once
  const initialRange: DateRange | undefined = (() => {
    const f = parseDateFromParam(sp.get("from"));
    const t = parseDateFromParam(sp.get("to"));
    return f || t ? { from: f, to: t } : undefined;
  })();

  const [range, setRange] = React.useState<DateRange | undefined>(initialRange);
  const [projectSelected, setProjectSelected] = React.useState<string>("all");
  const [taskSelected, setTaskSelected] = React.useState<string>("all");
  const [userSelected, setUserSelected] = React.useState<string>("all");
  const [open, setOpen] = React.useState(false);

  // 🔒 avoid loop: depend on primitives and only update when changed
  const fromParam = sp.get("from");
  const toParam = sp.get("to");

  React.useEffect(() => {
    const nextRange: DateRange | undefined =
      fromParam || toParam
        ? {
            from: parseDateFromParam(fromParam),
            to: parseDateFromParam(toParam),
          }
        : undefined;

    setRange((prev) => {
      const changed =
        !sameDate(prev?.from, nextRange?.from) ||
        !sameDate(prev?.to, nextRange?.to);
      return changed ? nextRange : prev;
    });
  }, [fromParam, toParam]);

  const hasDate = !!(range?.from || range?.to);

  const emitChange = React.useCallback(
    (
      overrides?: Partial<{
        projectId: string;
        taskId: string;
        userId: string;
        range: DateRange | undefined;
      }>,
    ) => {
      const nextProject = overrides?.projectId ?? projectSelected;
      const nextTask = overrides?.taskId ?? taskSelected;
      const nextUser = overrides?.userId ?? userSelected;
      const nextRange = overrides?.range ?? range;

      const { from, to } = formatFromToISO(nextRange);

      onChange?.({
        projectId: nextProject === "all" ? "" : nextProject,
        taskId: nextTask === "all" ? "" : nextTask,
        userId: nextUser === "all" ? "" : nextUser,
        from,
        to,
      });
    },
    [projectSelected, taskSelected, userSelected, range, onChange],
  );

  function apply() {
    emitChange();
    setOpen(false);
  }

  function onProjectChange(id: string) {
    setProjectSelected(id);
    emitChange({ projectId: id });
  }

  function onTaskChange(id: string) {
    setTaskSelected(id);
    emitChange({ taskId: id });
  }

  function onUserChange(id: string) {
    setUserSelected(id);
    emitChange({ userId: id });
  }

  function onRangeChange(next?: DateRange) {
    setRange(next);
  }

  function reset() {
    setRange(undefined);
    setProjectSelected("all");
    setTaskSelected("all");
    setUserSelected("all");
    setOpen(false);
    onChange?.({ projectId: "", taskId: "", userId: "", from: "", to: "" });
  }

  return (
    <div className="sm:flex sm:space-x-3">
      <div className="sm:flex items-center sm:space-x-3 sm:space-y-0 space-y-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start w-full sm:w-[256px]",
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
                <span data-testid="pickDate" className="text-muted-foreground">
                  {t("selectDateLabel")}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={8}
            className="p-3 w-[560px] sm:w-[640px]"
          >
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={range}
              locale={lang}
              onSelect={onRangeChange}
            />
            <div className="mt-3 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => onRangeChange(undefined)}>
                {t("clear")}
              </Button>
              <Button onClick={apply}>{t("apply")}</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Selected
          options={projects}
          value={projectSelected}
          onChange={onProjectChange}
          includeAll
          allLabel={t("allProjectsLabel")}
          placeholder={t("allProjectsLabel")}
          triggerClassName="w-full sm:w-[255px]"
        />

        <Selected
          options={tasks}
          value={taskSelected}
          onChange={onTaskChange}
          includeAll
          allLabel={t("allTasksLabel")}
          placeholder={t("allTasksLabel")}
          triggerClassName="w-full sm:w-[255px]"
        />

        <Selected
          options={users}
          value={userSelected}
          onChange={onUserChange}
          includeAll
          allLabel={t("everyone")}
          placeholder={t("everyone")}
          triggerClassName="w-full sm:w-[255px]"
        />
      </div>

      <div className="sm:mt-0 mt-3 flex space-x-3 justify-center">
        <Button
          variant="outline"
          className="w-full sm:w-[200px] bg-gray-100 cursor-pointer"
          onClick={reset}
        >
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}
