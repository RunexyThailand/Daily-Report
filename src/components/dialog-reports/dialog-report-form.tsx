"use client";
import TiptapEditor from "../form/tiptaps/tiptap-editor";
import { Form, Field, useFormikContext } from "formik";
import type { FieldInputProps } from "formik";
import { LoaderCircle } from "lucide-react";
import Selected from "../form/selector";
import DatePicker from "../form/date-picker";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  FormValues,
  formMode,
  ReportForm,
  LangValue,
} from "@/types/report-dialog-type";
import { Lang, TranslateInput, useTranslator } from "@/lib/services/translates";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const LanguageSchema = z.enum(["ja", "en", "th"]);

export default ({
  mode,
  projects,
  tasks,
  languages,
  isLoading,
  onClose,
}: ReportForm) => {
  const formik = useFormikContext<FormValues>();

  const { translate, result, isTranslating } = useTranslator();
  const [isTranslationDisable, setTranslationDisable] = useState(true);

  const t = useTranslations();

  const handleTranslation = (langCode: Lang) => {
    if (!formik.values.title[langCode] || !formik.values.detail[langCode]) {
      const input: TranslateInput = {
        title: formik.values.title.default,
        description: formik.values.detail.default,
      };

      translate(input, [langCode]);
    }
  };
  const checkTranslationDiable = () => {
    setTranslationDisable(
      !formik.values.title.default || !formik.values.detail.default,
    );
  };

  useEffect(() => {
    if (result && !isTranslating && formik.values.language_code) {
      formik.setFieldValue("title", {
        ...formik.values.title,
        [formik.values.language_code]:
          result.translations[formik.values.language_code]?.title,
        [result.source.languageCode]: result.original.title,
      });
      formik.setFieldValue("detail", {
        ...formik.values.detail,
        [formik.values.language_code]:
          result.translations[formik.values.language_code]?.description,
        [result.source.languageCode]: result.original.description,
      });
    }
  }, [isTranslating]);

  useEffect(checkTranslationDiable, [
    formik.values.title.default,
    formik.values.detail.default,
  ]);

  useEffect(() => {
    return () => {
      formik.resetForm();
    };
  }, []);

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
            {t("Common.project")}
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
            {t("Common.task")}
          </label>

          <Selected
            triggerClassName={`w-full ${mode === formMode.VIEW ? "pointer-events-none bg-gray-100" : ""}`}
            includeAll={false}
            value={formik.values.task_id ?? undefined}
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
            {t("Common.languages")}
          </label>

          <Selected
            triggerClassName={` bg-white ${mode === formMode.VIEW ? "pointer-events-none bg-white" : ""}`}
            includeAll={false}
            disabled={isTranslationDisable}
            value={formik.values.language_code ?? ""}
            placeholder="Languages"
            options={languages}
            onChange={(code) => {
              const langCode = LanguageSchema.parse(code);
              handleTranslation(langCode);
              formik.setFieldValue("language_code", langCode);
            }}
          />
        </div>
        <div className="space-y-1 mb-4">
          <label className="block text-sm font-medium text-muted-foreground">
            {t("Common.title")}
          </label>
          <Field name="title">
            {({ field }: { field: FieldInputProps<LangValue> }) => (
              <div className="relative">
                <Input
                  readOnly={mode === formMode.VIEW}
                  value={field.value[formik.values.language_code ?? "default"]}
                  placeholder={t("Common.title")}
                  className={`w-full bg-white ${mode === formMode.VIEW && "bg-gray-100"}`}
                  type="text"
                  onChange={(e) => {
                    let titleValue = { default: e.target.value };
                    if (formik.values.language_code) {
                      titleValue = {
                        ...titleValue,
                        [formik.values.language_code]: e.target.value,
                      };
                    }

                    formik.setFieldValue("title", titleValue);

                    if (formik.values.language_code) {
                      formik.setFieldValue("detail", {
                        default:
                          formik.values.detail[formik.values.language_code],
                        [formik.values.language_code]:
                          formik.values.detail[formik.values.language_code],
                      });
                    }

                    checkTranslationDiable();
                  }}
                />
              </div>
            )}
          </Field>
          {formik.touched.title && formik.errors.title && (
            <p className="text-sm text-destructive">
              {String(formik.errors.title.default)}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-muted-foreground">
            {t("Common.description")}
          </label>
          <Field name="detail">
            {({ field }: { field: FieldInputProps<LangValue> }) => (
              <TiptapEditor
                {...field}
                value={field.value[formik.values.language_code ?? "default"]}
                placeholder="พิมพ์ข้อความที่นี่…"
                minHeight="16rem"
                onChange={(html) => {
                  let detailValue = { default: html };
                  if (formik.values.language_code) {
                    detailValue = {
                      ...detailValue,
                      [formik.values.language_code]: html,
                    };
                  }

                  formik.setFieldValue("detail", detailValue);

                  if (formik.values.language_code) {
                    formik.setFieldValue("title", {
                      default: formik.values.title[formik.values.language_code],
                      [formik.values.language_code]:
                        formik.values.title[formik.values.language_code],
                    });
                  }

                  checkTranslationDiable();
                }}
                readOnly={mode === formMode.VIEW}
              />
            )}
          </Field>
          {formik.touched.detail && formik.errors.detail && (
            <p className="text-sm text-destructive">
              {String(formik.errors.detail.default)}
            </p>
          )}
        </div>
      </div>
      <div className="sm:flex justify-between space-x-5 space-y-2">
        <div className="w-full sm:w-1/2 space-y-1">
          <label className="block text-sm font-medium text-muted-foreground">
            {t("Common.progress")}
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
            {t("Common.dueDate")}
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
            variant="ghost"
            onClick={onClose}
            className="text-black bg-gray-100 cursor-pointer"
          >
            {t("Common.close")}
          </Button>
        )}
        {mode !== formMode.VIEW && (
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
          >
            {formik.isSubmitting ? <LoaderCircle /> : t("Common.save")}
          </Button>
        )}
      </DialogFooter>
    </Form>
  );
};
