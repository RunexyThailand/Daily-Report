"use client";
import { trpc } from "@/trpc/client";
import { type optionType } from "@/components/form/selected";
import ReportFilter from "@/components/filters/report-filter";
import CollapseCard from "@/components/CollapseCard";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, LoaderCircle, Plus } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { isEmpty } from "ramda";
import { Button } from "@/components/ui/button";
import DialogTask from "@/components/dialogTask";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

export default function ReportClient({
  projects,
  tasks,
  users,
}: {
  projects: optionType[];
  tasks: optionType[];
  users: optionType[];
}) {
  const t = useTranslations("DailyReportPage");

  const [isOpen, setIsOpen] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [userId, setUserId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const currentLang = useLocale();

  const { data: usersQuery, isFetching } = trpc.getUserReport.useQuery({
    userId,
    lang: currentLang.toLocaleUpperCase() === "JP" ? "JP" : "DEFAULT",
    taskId,
    projectId,
    from,
    to,
  });

  const userReport =
    usersQuery?.users.map((user) => ({
      id: String(user.id),
      label: user.name || "",
      reports: user.reports,
    })) || [];

  return (
    <>
      <div className="my-10 sm:flex justify-center">
        <ReportFilter
          projects={projects}
          tasks={tasks}
          users={users}
          onChange={({ projectId, taskId, userId, from, to }) => {
            setTaskId(taskId);
            setUserId(userId);
            setProjectId(projectId);
            setFrom(from);
            setTo(to);
          }}
        />
      </div>
      <div className="sm:px-10 flex-rows space-y-4">
        {isFetching ? (
          <div className="flex justify-center mt-20">{t("loading")}</div>
        ) : isEmpty(userReport) ? (
          <div className="flex justify-center mt-20">
            <div>{t("reportEmpty")}</div>
          </div>
        ) : (
          userReport.map((user) => {
            return (
              <CollapseCard
                title={user.label}
                defaultOpen={false}
                key={user.id}
              >
                <div className="py-4 flex-rows space-y-4">
                  {user.reports.map((report) => {
                    return (
                      <Card
                        className="overflow-hidden p-0"
                        key={report.report_id}
                      >
                        <CardHeader className="p-0 gap-0">
                          <div
                            className={cn(
                              "flex w-full select-none items-center gap-3 px-4 py-3",
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <CardTitle className="flex justify-end space-x-2">
                                {report.project_name && (
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor: "#234868",
                                      color: "#ffffff",
                                    }}
                                  >
                                    {report.project_name}
                                  </Badge>
                                )}
                                {report.task_name && (
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor: "#31628eff",
                                      color: "#ffffff",
                                    }}
                                  >
                                    {report.task_name}
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="py-5">
                                <div className="font-bold text-18 mb-2">
                                  {report.title}
                                </div>
                                <div>{report.detail}</div>
                              </CardDescription>
                              <CardFooter className="p-0 flex justify-end space-x-4">
                                <div className="flex items-center space-x-1">
                                  <LoaderCircle
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                  <label>{report.progress}%</label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                  <span>
                                    {DateTime.fromJSDate(
                                      report.report_date,
                                    ).toFormat("dd/LL/yyyy")}
                                  </span>
                                </div>
                              </CardFooter>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </CollapseCard>
            );
          })
        )}
      </div>
      <Button
        className="fixed bottom-6 right-6 rounded-full bg-green-500 hover:bg-green-600 text-white w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer"
        size="icon"
        aria-label="Add"
        onClick={() => setIsOpen(true)}
      >
        <Plus size={32} />
      </Button>
      <DialogTask isOpen={isOpen} onClose={() => setIsOpen(false)} mode="ADD" />
    </>
  );
}
