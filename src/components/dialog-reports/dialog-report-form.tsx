"use client";
import TiptapEditor from "../form/tiptaps/tiptap-editor";
import { Formik, Form, Field, useFormikContext } from "formik";
import type { FieldInputProps } from "formik";
import { LoaderCircle } from "lucide-react";
import Selected from "../form/selector";
import DatePicker from "../form/date-picker";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { FormValues, formMode, ReportForm } from "@/types/report-dialog-type";
import { TranslateInput, useTranslator } from "@/lib/services/translates";
import { useEffect, useState } from "react";

export default ({
  mode,
  projects,
  tasks,
  languages,
  isLoading,
  onOpenDeleteDialog,
}: ReportForm) => {
  const formik = useFormikContext<FormValues>();
  const { translate, result, isTranslating } = useTranslator();
  const [isTranslationDisable, setTranslationDisable] = useState(true);

  const t = useTranslations();

  const handleTranslation = () => {
    const input: TranslateInput = {
      title: formik.values.title,
      description: formik.values.detail,
    };
    setTranslationDisable(true);
    // translate(input);
  };

  const checkTranslationDiable = () => {
    setTranslationDisable(!formik.values.title || !formik.values.detail);
  };

  useEffect(() => {
    if (!isTranslating && result) {
      console.log("result", result);
      setTranslationDisable(true);
    }
  }, [isTranslating]);

  useEffect(checkTranslationDiable, [
    formik.values.title,
    formik.values.detail,
  ]);

  return (
    <Form className="flex-col space-y-4">
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70">
          <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
        </div>
      )}
      <div className="w-48 flex justify-self-end">
        <DatePicker
          className={`w-full ${mode === formMode.VIEW && "pointer-events-none bg-gray-100"}`}
          value={formik.values.reportDate}
          onChange={(date) =>
            mode === formMode.VIEW
              ? undefined
              : formik.setFieldValue("reportDate", date)
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
            value={formik.values.project_id ?? ""}
            triggerClassName={`w-full ${mode === formMode.VIEW ? "pointer-events-none bg-gray-100" : ""}`}
            placeholder="Project"
            options={projects}
            onChange={(id) =>
              mode === formMode.VIEW
                ? undefined
                : formik.setFieldValue("project_id", id)
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
            value={formik.values.task_id ?? ""}
            placeholder="Task"
            options={tasks}
            onChange={(id) =>
              mode === formMode.VIEW
                ? undefined
                : formik.setFieldValue("task_id", id)
            }
          />
        </div>
      </div>
      <div className="flex-col bg-[#f0f9fd] rounded-lg p-4">
        <div className="space-y-1 flex flex-col justify-self-end pb-4">
          <label className="block text-sm font-medium text-muted-foreground">
            Languages
          </label>

          <Selected
            triggerClassName={` bg-white ${mode === formMode.VIEW ? "pointer-events-none bg-white" : ""}`}
            includeAll={false}
            disabled={isTranslationDisable}
            value={formik.values.language_id ?? ""}
            placeholder="Languages"
            options={languages}
            onChange={() => {
              handleTranslation();
            }}
            // onChange={(id) =>
            //     mode === formMode.VIEW
            //         ? undefined
            //         : setFieldValue("language_id", id)
            // }
          />
        </div>
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
                onChange={(e) => {
                  formik.setFieldValue("title", e.target.value);
                  formik.setFieldValue("language_id", null);
                  checkTranslationDiable();
                }}
              />
            )}
          </Field>
          {formik.touched.title && formik.errors.title && (
            <p className="text-sm text-destructive">
              {String(formik.errors.title)}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-muted-foreground">
            Description
          </label>
          <Field name="detail">
            {({ field }: { field: FieldInputProps<string> }) => (
              <TiptapEditor
                {...field}
                defaultValue="<p>Hello Tiptap!</p>"
                placeholder="พิมพ์ข้อความที่นี่…"
                minHeight="16rem"
                onChange={(html) => {
                  formik.setFieldValue("detail", html);
                  formik.setFieldValue("language_id", null);
                  checkTranslationDiable();
                }}
                readOnly={mode === formMode.VIEW}
              />
            )}
          </Field>
        </div>
      </div>
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
                    formik.setFieldValue(
                      "progress",
                      Number.isNaN(n) ? null : n,
                    );
                  }}
                />
                {formik.touched.progress && formik.errors.progress && (
                  <p className="text-sm text-destructive">
                    {String(formik.errors.progress)}
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
              mode === formMode.VIEW ? "pointer-events-none bg-gray-100" : ""
            }
            value={formik.values.dueDate}
            placeholder="Pick a due date"
            onChange={(date) =>
              mode === formMode.VIEW
                ? undefined
                : formik.setFieldValue("dueDate", date)
            }
          />
        </div>
      </div>
      <DialogFooter className="mt-4">
        {mode === formMode.EDIT && (
          <Button
            type="button"
            onClick={onOpenDeleteDialog}
            className="bg-red-500 hover:bg-red-700 text-white cursor-pointer"
          >
            {t("Common.delete")}
          </Button>
        )}
        {mode !== formMode.VIEW && (
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="bg-green-500 hover:bg-green-700 text-white cursor-pointer"
          >
            {formik.isSubmitting ? <LoaderCircle /> : t("Common.save")}
          </Button>
        )}
      </DialogFooter>
    </Form>
  );
};
