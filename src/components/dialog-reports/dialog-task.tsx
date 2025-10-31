"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { createReport, updateReport } from "@/actions/report";
import { toast } from "sonner";
import { useState } from "react";
import DialogReportForm from "../dialog-reports/dialog-report-form";
import {
  AddReportDialogProps,
  CreateReportInput,
  FormValues,
  LangValue,
  formMode,
} from "@/types/report-dialog-type";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ReportInput } from "@/server/routers/types";
import { trpc } from "@/trpc/client";
import { isNotEmptyHtml } from "@/lib/utils";
import { DateTime } from "luxon";

type IntlFormatFn = (opts: {
  id: string;
  defaultMessage?: string;
  values?: Record<string, unknown>;
}) => string;

type NextIntlT = ReturnType<typeof useTranslations>;

function toIntlFormatFn(t: NextIntlT): IntlFormatFn {
  return ({ id, defaultMessage, values }) => {
    try {
      const out = t(
        id as string,
        values as Record<string, string | number | Date> | undefined,
      );
      return typeof out === "string" ? out : String(out);
    } catch {
      return defaultMessage ?? id;
    }
  };
}

const optionalHtml = Yup.string()
  .transform((v, o) =>
    typeof o === "string" && o.trim() === "" ? undefined : v,
  )
  .test("html-non-empty-if-present", "Invalid html", (v) =>
    v === undefined ? true : isNotEmptyHtml(v),
  )
  .notRequired();

const buildValidationSchema = (fmt: IntlFormatFn) => {
  return Yup.object({
    reportDate: Yup.date(),
    project_id: Yup.string().nullable().optional(),
    task_id: Yup.string().nullable().optional(),
    title: Yup.object({
      default: Yup.string().required(fmt({ id: "Validation.titleRequired" })),
      en: Yup.string().optional(),
      ja: Yup.string().optional(),
      th: Yup.string().optional(),
    }),
    detail: Yup.object({
      default: Yup.string()
        .required(fmt({ id: "Validation.detailRequired" }))
        .test(
          "html-not-empty-or-img",
          fmt({ id: "Validation.detailRequired" }),
          (v) => isNotEmptyHtml(v || ""),
        ),
      en: optionalHtml,
      ja: optionalHtml,
      th: optionalHtml,
    }).required(),
    progress: Yup.number()
      .nullable()
      .transform((v, o) => (o === "" ? null : v))
      .min(0, "Min 0")
      .max(100, "Max 100"),
    dueDate: Yup.date().nullable(),
    language_code: Yup.string().nullable(),
  });
};

const getInitialValues = (
  reportData?: CreateReportInput | null,
): FormValues => {
  return {
    reportDate: reportData?.report_date ?? new Date(),
    project_id: reportData?.project_id ?? null,
    task_id: reportData?.task_id ?? null,
    title: reportData?.title ?? { default: "" },
    detail: reportData?.detail ?? { default: "" },
    progress: reportData?.progress ?? null,
    dueDate: reportData?.due_date ?? null,
    language_code: reportData?.languageCode ?? null,
  };
};

export default function AddReportDialog({
  projects,
  tasks,
  languages,
  onClose,
  onSuccess,
  isOpen,
  reportId,
  mode,
  languageCode,
}: AddReportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const i18n = toIntlFormatFn(t);

  const validationSchema = React.useMemo(
    () => buildValidationSchema(i18n),
    [i18n],
  );

  const { data: reportQuery, isFetching: isFetchingReport } =
    trpc.getReportById.useQuery(reportId as string, {
      enabled: isOpen && !!reportId,
    });

  const { title, detail } = React.useMemo(() => {
    if (!reportQuery)
      return {
        title: null as LangValue | null,
        detail: null as LangValue | null,
      };

    const titleLV = reportQuery.report_trans.reduce<LangValue>(
      (acc, r) => {
        acc[r.language] = r.title;
        return acc;
      },
      {
        default:
          reportQuery.report_trans.find((t) => t.language === languageCode)
            ?.title ??
          reportQuery.report_trans[0]?.title ??
          "",
      },
    );

    const detailLV = reportQuery.report_trans.reduce<LangValue>(
      (acc, r) => {
        acc[r.language] = r.detail;
        return acc;
      },
      {
        default:
          reportQuery.report_trans.find((t) => t.language === languageCode)
            ?.detail ??
          reportQuery.report_trans[0]?.detail ??
          "",
      },
    );

    return { title: titleLV, detail: detailLV };
  }, [reportQuery, languageCode]);

  const coerceDate = (d: Date | string | null | undefined): Date | null =>
    d ? new Date(d) : null;

  const initialValues: CreateReportInput = {
    id: reportQuery?.id,
    project_id: reportQuery?.project_id || null,
    task_id: reportQuery?.task_id || null,
    report_date: coerceDate(reportQuery?.report_date),
    progress: reportQuery?.progress || null,
    due_date: reportQuery?.due_date || null,
    title: title ?? { default: "" },
    detail: detail ?? { default: "" },
    languageCode: mode === formMode.EDIT ? languageCode : null,
  };

  const onSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    setSubmitting(false);
    setIsLoading(true);
    try {
      const reportDateToUtc = DateTime.fromJSDate(values.reportDate)
        .startOf("day")
        .setZone("UTC", { keepLocalTime: true }).toJSDate()

      const payload: ReportInput = {
        project_id: values.project_id,
        task_id: values.task_id,
        reportDate: reportDateToUtc,
        progress: values.progress ?? null,
        dueDate: values.dueDate ?? null,
        title: values.title,
        detail: values.detail,
        language_code: values.language_code,
      };
      
      if (mode === formMode.EDIT) {
        payload.id = reportId || null;
        await updateReport(payload as ReportInput & { id: string });
      } else {
        await createReport(payload);
      }
      toast.success(`${t(`Common.save`)} ${t(`ResponseStatus.success`)}`);
      onSuccess?.();
    } catch (err) {
      toast.error(`${t(`Common.save`)} ${t(`ResponseStatus.error`)}`, {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
    setIsLoading(false);
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
          {isFetchingReport ? (
            <div className="text-[30px] text-center w-full">
              {t("Common.loading")}
            </div>
          ) : (
            <Formik<FormValues>
              initialValues={getInitialValues(initialValues)}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              <DialogReportForm
                mode={mode}
                projects={projects}
                tasks={tasks}
                languages={languages}
                isLoading={isLoading}
                onClose={onClose}
              />
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
