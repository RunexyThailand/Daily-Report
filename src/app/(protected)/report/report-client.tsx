"use client";
import { trpc } from "@/trpc/client";
import { type optionType } from "@/components/form/selector";
import ReportFilter from "@/components/filters/report-filter";
import CollapseCard from "@/components/collapse-card";
import { LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { isEmpty } from "ramda";
import { Button } from "@/components/ui/button";
import DialogTask from "@/components/dialog-reports/dialog-task";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { formMode } from "@/types/report-dialog-type";
import ReportCard from "@/components/reports/report-card";
import { Lang } from "@/lib/services/translates";
import DialogConfirm from "@/components/dialog/dialog-confirm";
import { toast } from "sonner";
import { deleteReport } from "@/actions/report";

const languages: optionType[] = [
  { id: "ja", label: "Japanese" },
  { id: "en", label: "English" },
  { id: "th", label: "Thai" },
];

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
  const rootT = useTranslations("");

  const [isOpen, setIsOpen] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [userId, setUserId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [action, setAction] = useState<formMode>(formMode.CREATE);
  const currentLang = useLocale() as Lang;
  const [reportId, setReportId] = useState<string | null>(null);
  const [languageCode, setLanguageCode] = useState<Lang | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const {
    data: usersQuery,
    refetch,
    isFetching,
  } = trpc.getUserReport.useQuery({
    userId,
    lang: currentLang,
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

  const handleDelete = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      toast.success(
        `${rootT(`Common.delete`)} ${rootT(`ResponseStatus.success`)}`,
      );
    } catch (err) {
      toast.error(
        `${rootT(`Common.delete`)} ${rootT(`ResponseStatus.error`)}`,
        {
          description: err instanceof Error ? err.message : "Unknown error",
        },
      );
    } finally {
      setShowConfirmDialog(false);
      refetch();
    }
  };

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
          <div className="flex justify-center mt-20">
            <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
          </div>
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
                      <ReportCard
                        creatorId={report.created_by}
                        translates={report.translates}
                        reportDate={report.report_date}
                        lang={currentLang}
                        reportId={report.report_id}
                        key={report.report_id}
                        projectName={report.project_name}
                        dueDate={report.due_date}
                        taskName={report.task_name}
                        progress={report.progress}
                        onOpenDialog={(lange: Lang) => {
                          setIsOpen(true);
                          setReportId(report.report_id);
                          setAction(formMode.EDIT);
                          setLanguageCode(lange);
                        }}
                        onDelete={() => {
                          setReportId(report.report_id);
                          setShowConfirmDialog(true);
                        }}
                      />
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
        onClick={() => {
          setReportId(null);
          setAction(formMode.CREATE);
          setIsOpen(true);
        }}
      >
        <Plus size={32} />
      </Button>
      <DialogTask
        reportId={reportId}
        languageCode={languageCode || "ja"}
        isOpen={isOpen}
        projects={projects}
        tasks={tasks}
        languages={languages}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          setIsOpen(false);
          refetch();
        }}
        mode={action}
      />
      <DialogConfirm
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          handleDelete(reportId as string);
        }}
      />
    </>
  );
}
