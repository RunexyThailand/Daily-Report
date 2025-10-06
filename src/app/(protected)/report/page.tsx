import CollapseCard from "@/components/CollapseCard";
import ReportFilter from "@/components/filters/report-filter";
// import { prisma } from "@/server/db";
// import { useTranslations } from "next-intl";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LoaderCircle, Calendar } from "lucide-react";
import { DateTime } from "luxon";

export default async function ReportPage() {
  const caller = appRouter.createCaller(await createTRPCContext());
  const [projectsData, tasksData, userData] = await Promise.all([
    caller.getProjects(),
    caller.getTasks(),
    caller.getUsers({ date: "2025-10-03 08:28:33.179" }),
  ]);

  const projects = projectsData.projects.map((project) => ({
    id: String(project.id),
    label: project.name,
  }));

  const tasks = tasksData.tasks.map((task) => ({
    id: String(task.id),
    label: task.name,
  }));

  const users = userData.users.map((user) => ({
    id: String(user.id),
    label: user.name || "",
    reports: user.reports,
  }));

  return (
    <div>
      <div className="my-10 flex justify-center">
        <ReportFilter projects={projects} tasks={tasks} users={users} />
      </div>
      <div className="px-10 flex-rows space-y-4">
        {users.map((user) => {
          return (
            <CollapseCard title={user.label} defaultOpen={false} key={user.id}>
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
                            <CardTitle className="truncate flex justify-end space-x-2">
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
                            <CardDescription className="truncate py-5">
                              {report.detail}
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
        })}
      </div>
    </div>
  );
}
