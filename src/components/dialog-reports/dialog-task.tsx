"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { createReport, deleteReport, updateReport } from "@/actions/report";
import { toast } from "sonner";
import { useState } from "react";
import DialogConfirm from "../dialog/dialog-confirm";
import DialogReportForm from "../dialog-reports/dialog-report-form";
import {
  AddReportDialogProps,
  CreateReportInput,
  FormValues,
  formMode,
} from "@/types/report-dialog-type";
import { Formik } from "formik";
import * as Yup from "yup";
import { ReportInput } from "@/server/routers/types";

const Schema = Yup.object({
  reportDate: Yup.date(),
  project_id: Yup.string().nullable().optional(),
  task_id: Yup.string().nullable().optional(),
  title: Yup.object({
    default: Yup.string().required("Default title is required"),
    en: Yup.string().optional(),
    ja: Yup.string().optional(),
    th: Yup.string().optional(),
  }),
  detail: Yup.object({
    default: Yup.string().required("Default title is required"),
    en: Yup.string().optional(),
    ja: Yup.string().optional(),
    th: Yup.string().optional(),
  }),
  progress: Yup.number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v))
    .min(0, "Min 0")
    .max(100, "Max 100"),
  dueDate: Yup.date().nullable(),
  language_code: Yup.string().nullable(),
});

const getInitialValues = (
  reportData?: CreateReportInput | null,
): FormValues => {
  return {
    reportDate: reportData?.report_date ?? new Date(),
    project_id: reportData?.project_id ?? null,
    task_id: reportData?.task_id ?? null,
    title: { default: "" },
    detail: { default: "" },
    progress: reportData?.progress ?? null,
    dueDate: reportData?.due_date ?? null,
    language_code: null,
  };
};

export default function AddReportDialog({
  projects,
  tasks,
  languages,
  onClose,
  onSuccess,
  isOpen,
  reportData,
  mode,
}: AddReportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const t = useTranslations();
  console.log("reportData", reportData);

  const handleDelete = async (reportId: string) => {
    try {
      setIsLoading(true);
      await deleteReport(reportId);
      toast.success(`${t(`Common.delete`)} ${t(`ResponseStatus.success`)}`);
      onSuccess?.();
      setIsLoading(false);
    } catch (err) {
      toast.error(`${t(`Common.delete`)} ${t(`ResponseStatus.error`)}`, {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="w-full h-[95vh] supports-[height:100svh]:h-[95svh] overflow-y-auto overscroll-y-auto"
        >
          <DialogHeader>
            <DialogTitle>{t(`Common.${mode}_Report`)}</DialogTitle>
          </DialogHeader>
          <Formik<FormValues>
            initialValues={getInitialValues(reportData)}
            validationSchema={Schema}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(false);
              setIsLoading(true);
              try {
                const payload: ReportInput = {
                  project_id: values.project_id,
                  task_id: values.task_id,
                  reportDate: values.reportDate,
                  progress: values.progress ?? null,
                  dueDate: values.dueDate ?? null,
                  title: values.title,
                  detail: values.detail,
                  language_code: values.language_code,
                };
                if (mode === formMode.EDIT) {
                  // payload.id = reportData?.id;
                  // await updateReport(
                  //   payload as CreateReportInput & { id: string },
                  // );
                } else {
                  await createReport(payload);
                }
                toast.success(
                  `${t(`Common.save`)} ${t(`ResponseStatus.success`)}`,
                );
                onSuccess?.();
              } catch (err) {
                toast.error(
                  `${t(`Common.save`)} ${t(`ResponseStatus.error`)}`,
                  {
                    description:
                      err instanceof Error ? err.message : "Unknown error",
                  },
                );
                setSubmitting(false);
              } finally {
                setSubmitting(false);
              }
              setIsLoading(false);
            }}
          >
            <DialogReportForm
              mode={mode}
              projects={projects}
              tasks={tasks}
              languages={languages}
              isLoading={isLoading}
              onOpenDeleteDialog={() => {
                setShowConfirmDialog(true);
              }}
            />
          </Formik>
        </DialogContent>
      </Dialog>
      <DialogConfirm
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          handleDelete(reportData?.id ?? "");
          setShowConfirmDialog(false);
        }}
      />
    </>
  );
}
