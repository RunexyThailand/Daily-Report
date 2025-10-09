"use client";

import * as React from "react";
import { Formik, Form, Field, useField } from "formik";
import type { FieldInputProps } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoaderCircle } from "lucide-react";
import Selected from "./form/selected";
import DatePicker from "./form/date-picker";
import { useLocale, useTranslations } from "next-intl";
import { createReport, deleteReport } from "@/actions/report";
import { Language } from "@prisma/client";

// Types
export type ReportTrans = {
  language: "DEFAULT" | "JP";
  title: string;
  detail: string;
};

export type CreateReportInput = {
  id?: string;
  project_id: string | null;
  task_id: string | null;
  report_date: Date;
  progress: number | null;
  due_date: Date | null;
  report_trans: ReportTrans[];
};

type FormValues = {
  reportDate: Date;
  project_id: string | null;
  task_id: string | null;
  title: string;
  detail: string;
  titleJP: string;
  detailJP: string;
  progress: number | null;
  dueDate: Date | null;
};

export enum formMode {
  VIEW = "VIEW",
  CREATE = "CREATE",
  EDIT = "EDIT",
}

export type AddReportDialogProps = {
  isOpen: boolean;
  projects: { id: string; label: string }[];
  tasks: { id: string; label: string }[];
  // t?: (key: string) => string;
  onSuccess?: () => void;
  onClose?: () => void;
  reportData?: CreateReportInput | null;
  mode: formMode;
};

const Schema = Yup.object({
  reportDate: Yup.date(),
  project_id: Yup.string(),
  task_id: Yup.string(),
  title: Yup.string().trim().required("Title is required"),
  detail: Yup.string().trim().required("Description is required"),
  titleJP: Yup.string().trim().optional(),
  detailJP: Yup.string().trim().optional(),
  progress: Yup.number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v))
    .min(0, "Min 0")
    .max(100, "Max 100"),
  dueDate: Yup.date().nullable(),
});

export default function AddReportDialog({
  projects,
  tasks,
  onClose,
  // t = (s) => s,
  onSuccess,
  isOpen,
  reportData,
  mode,
}: AddReportDialogProps) {
  const currentLang = useLocale();
  const t = useTranslations();
  const getInitialValues = (
    reportData?: CreateReportInput | null,
  ): FormValues => {
    if (!reportData) {
      return {
        reportDate: new Date(),
        project_id: null,
        task_id: null,
        title: "",
        detail: "",
        titleJP: "",
        detailJP: "",
        progress: null,
        dueDate: null,
      };
    }
    return {
      reportDate: reportData.report_date ?? new Date(),
      project_id: reportData.project_id ?? null,
      task_id: reportData.task_id ?? null,
      title:
        reportData.report_trans.find((x) => x.language === "DEFAULT")?.title ??
        "",
      detail:
        reportData.report_trans.find((x) => x.language === "DEFAULT")?.detail ??
        "",
      titleJP:
        reportData.report_trans.find((x) => x.language === "JP")?.title ?? "",
      detailJP:
        reportData.report_trans.find((x) => x.language === "JP")?.detail ?? "",
      progress: reportData.progress ?? null,
      dueDate: reportData.due_date ?? null,
    };
  };

  const handleDelete = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      onSuccess?.();
    } catch (err) {
      console.error("Delete failed:", err);
    }
    // Handle delete action
  };
  // const { toast } = useToast();

  // const utils = trpc.useUtils?.();
  // const createMutation = trpc.report.create.useMutation({
  //   onSuccess: async () => {
  //     // toast({ title: "Report created" });
  //     // invalidate any list queries if available
  //     await utils?.trpc?.list?.invalidate?.();
  //     setOpen(false);
  //     onSuccess?.();
  //   },
  //   onError: (err) => {
  //     // toast({ title: "Failed to create", description: err.message, variant: "destructive" });
  //   },
  // });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t(`Common.${mode}_Report`)}</DialogTitle>
          <DialogDescription>
            {/* {t("Fill in the task details and save.")} */}
            {}
          </DialogDescription>
        </DialogHeader>

        <Formik<FormValues>
          initialValues={getInitialValues(reportData)}
          validationSchema={Schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const payload: CreateReportInput = {
                project_id: values.project_id,
                task_id: values.task_id,
                report_date: new Date(),
                progress: values.progress ?? null,
                due_date: values.dueDate ?? null,
                report_trans: [
                  {
                    language: "DEFAULT",
                    title: values.title,
                    detail: values.detail,
                  },
                  {
                    language: "JP",
                    title: values.titleJP,
                    detail: values.detailJP,
                  },
                ],
              };
              await createReport(payload);
              onSuccess?.();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form className="flex-col space-y-4">
              <div className="w-48 flex justify-self-end">
                <DatePicker
                  className={`w-full ${mode === formMode.VIEW && "pointer-events-none bg-gray-100"}`}
                  value={values.reportDate}
                  onChange={(date) =>
                    mode === formMode.VIEW
                      ? undefined
                      : setFieldValue("reportDate", date)
                  }
                />
              </div>
              <div className="sm:flex justify-between space-x-5 space-y-3">
                <div className="space-y-1 w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Project
                  </label>

                  <Selected
                    includeAll={false}
                    value={values.project_id ?? ""}
                    triggerClassName={`w-full ${mode === formMode.VIEW ? "pointer-events-none bg-gray-100" : ""}`}
                    placeholder="Project"
                    options={projects}
                    onChange={(id) =>
                      mode === formMode.VIEW
                        ? undefined
                        : setFieldValue("project_id", id)
                    }
                  />
                </div>
                <div className="space-y-1 w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Task
                  </label>

                  <Selected
                    triggerClassName={`w-full ${mode === formMode.VIEW ? "pointer-events-none bg-gray-100" : ""}`}
                    includeAll={false}
                    value={values.task_id ?? ""}
                    placeholder="Task"
                    options={tasks}
                    onChange={(id) =>
                      mode === formMode.VIEW
                        ? undefined
                        : setFieldValue("task_id", id)
                    }
                  />
                </div>
              </div>
              <Tabs
                defaultValue={
                  mode === formMode.VIEW
                    ? currentLang.toUpperCase() === Language.JP
                      ? "2"
                      : "1"
                    : "1"
                }
                className="w-full"
              >
                <div className="flex-col bg-[#f4fafd] rounded-lg p-4">
                  <div className="flex justify-self-end">
                    <TabsList>
                      <TabsTrigger value="1" className="cursor-pointer">
                        Default
                      </TabsTrigger>
                      <TabsTrigger value="2" className="cursor-pointer">
                        JP
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="1">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-muted-foreground">
                        Title
                      </label>
                      <Field name="title">
                        {({ field }: { field: FieldInputProps<string> }) => (
                          <Input
                            readOnly={mode === formMode.VIEW}
                            {...field}
                            placeholder={t("Common.title")}
                            className={`w-full mb-4 bg-white ${mode === formMode.VIEW && "bg-gray-100"}`}
                            type="text"
                          />
                        )}
                      </Field>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-muted-foreground">
                        Description
                      </label>
                      <Field name="detail">
                        {({ field }: { field: FieldInputProps<string> }) => (
                          <Textarea
                            readOnly={mode === formMode.VIEW}
                            {...field}
                            placeholder={t("Common.description")}
                            className={`w-full mb-4 bg-white ${mode === formMode.VIEW && "bg-gray-100"}`}
                            rows={10}
                            cols={5}
                          />
                        )}
                      </Field>
                    </div>
                  </TabsContent>
                  <TabsContent value="2">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-muted-foreground">
                        Title
                      </label>
                      <Field name="titleJP">
                        {({ field }: { field: FieldInputProps<string> }) => (
                          <Input
                            {...field}
                            placeholder={t("Common.title")}
                            className={`w-full mb-4 bg-white ${mode === formMode.VIEW && "bg-gray-100"}`}
                            type="text"
                            readOnly={mode === formMode.VIEW}
                          />
                        )}
                      </Field>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-muted-foreground">
                        Description
                      </label>
                      <Field name="detailJP">
                        {({ field }: { field: FieldInputProps<string> }) => (
                          <Textarea
                            {...field}
                            placeholder={t("Common.description")}
                            className={`w-full mb-4 bg-white ${mode === formMode.VIEW && "bg-gray-100"}`}
                            rows={10}
                            cols={5}
                            readOnly={mode === formMode.VIEW}
                          />
                        )}
                      </Field>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="sm:flex justify-between space-x-5 space-y-2">
                <div className="w-full sm:w-1/2 space-y-1">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Progress
                  </label>
                  <Field name="progress">
                    {({ field }: { field: FieldInputProps<number | null> }) => (
                      <div className="w-full">
                        <Input
                          readOnly={mode === formMode.VIEW}
                          name={field.name}
                          onBlur={field.onBlur}
                          value={field.value ?? ""}
                          placeholder={`${t("Common.progress")} (%)`}
                          className={`w-full mb-2 ${mode === formMode.VIEW && "bg-gray-100"}`}
                          type="number"
                          inputMode="numeric"
                          onChange={(e) => {
                            const v = e.target.value;
                            const n = v === "" ? null : Number.parseInt(v, 10);
                            setFieldValue(
                              "progress",
                              Number.isNaN(n) ? null : n,
                            );
                          }}
                        />
                        {touched.progress && errors.progress && (
                          <p className="text-sm text-destructive">
                            {String(errors.progress)}
                          </p>
                        )}
                      </div>
                    )}
                  </Field>
                </div>

                <div className="w-full sm:w-1/2 space-y-1">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Due date
                  </label>
                  <DatePicker
                    className={
                      mode === formMode.VIEW
                        ? "pointer-events-none bg-gray-100"
                        : ""
                    }
                    value={values.dueDate}
                    placeholder="Pick a due date"
                    onChange={(date) =>
                      mode === formMode.VIEW
                        ? undefined
                        : setFieldValue("dueDate", date)
                    }
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                {mode === formMode.EDIT && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDelete(reportData?.id ?? "")}
                    className="bg-red-500 hover:bg-red-700 text-white cursor-pointer"
                  >
                    {t("Common.delete")}
                  </Button>
                )}
                {mode !== formMode.VIEW && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-500 hover:bg-green-700 text-white cursor-pointer"
                  >
                    {isSubmitting ? <LoaderCircle /> : t("Common.save")}
                  </Button>
                )}
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
