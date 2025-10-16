"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { deleteReport } from "@/actions/report";
import { toast } from "sonner";
import { useState } from "react";
import DialogConfirm from "../dialog/dialog-confirm";
import DialogReportForm from "../dialog-reports/dialog-report-form";
import {
  AddReportDialogProps,
  CreateReportInput,
  FormValues,
} from "@/types/report-dialog-type";
import { Formik } from "formik";
import * as Yup from "yup";

const Schema = Yup.object({
  reportDate: Yup.date(),
  project_id: Yup.string().nullable().optional(),
  task_id: Yup.string().nullable().optional(),
  title: Yup.string().trim().required("Title is required"),
  detail: Yup.string().trim().required("Description is required"),
  progress: Yup.number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v))
    .min(0, "Min 0")
    .max(100, "Max 100"),
  dueDate: Yup.date().nullable(),
  language_id: Yup.string(),
});

const getInitialValues = (
  reportData?: CreateReportInput | null,
): FormValues => {
  return {
    reportDate: reportData?.report_date ?? new Date(),
    project_id: reportData?.project_id ?? null,
    task_id: reportData?.task_id ?? null,
    title: "",
    detail: "",
    progress: reportData?.progress ?? null,
    dueDate: reportData?.due_date ?? null,
    language_id: null,
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
        <DialogContent className="w-full h-[95vh] supports-[height:100svh]:h-[95svh] overflow-y-auto overscroll-y-auto">
          <DialogHeader>
            <DialogTitle>{t(`Common.${mode}_Report`)}</DialogTitle>
          </DialogHeader>
          <Formik<FormValues>
            initialValues={getInitialValues(reportData)}
            validationSchema={Schema}
            onSubmit={async (values, { setSubmitting }) => {
              // setIsLoading(true);
              // try {
              //   const payload: CreateReportInput = {
              //     project_id: values.project_id,
              //     task_id: values.task_id,
              //     report_date: values.reportDate,
              //     progress: values.progress ?? null,
              //     due_date: values.dueDate ?? null,
              //     report_trans: [
              //       {
              //         language: "DEFAULT",
              //         title: values.title,
              //         detail: values.detail,
              //       },
              //       {
              //         language: "JP",
              //         title: values.titleJP,
              //         detail: values.detailJP,
              //       },
              //     ],
              //   };
              //   if (mode === formMode.EDIT) {
              //     payload.id = reportData?.id;
              //     await updateReport(
              //       payload as CreateReportInput & { id: string },
              //     );
              //   } else {
              //     await createReport(payload);
              //   }
              //   toast.success(
              //     `${t(`Common.save`)} ${t(`ResponseStatus.success`)}`,
              //   );
              //   onSuccess?.();
              // } catch (err) {
              //   toast.error(
              //     `${t(`Common.save`)} ${t(`ResponseStatus.error`)}`,
              //     {
              //       description:
              //         err instanceof Error ? err.message : "Unknown error",
              //     },
              //   );
              //   setSubmitting(false);
              // } finally {
              //   setSubmitting(false);
              // }
              // setIsLoading(false);
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
