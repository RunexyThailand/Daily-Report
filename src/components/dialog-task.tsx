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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon, Plus } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";

// IMPORTANT: adjust this import to your app's tRPC client helper
// e.g. `@/trpc/react` (create-t3-app style) or `@/utils/api`
import { trpc } from "@/trpc/client";
import Selected from "./form/selected";
import DatePicker from "./form/date-picker";
import { DateTime } from "luxon";

// Types
export type ReportTrans = {
  language: "DEFAULT" | "JP";
  title: string;
  detail: string;
};

export type CreateReportInput = {
  project_id: string | null;
  task_id: string | null;
  report_date: Date;
  progress: number | null;
  due_date: Date | null;
  report_trans: ReportTrans[];
};

type FormValues = {
  reportDate: Date;
  project_id: string;
  task_id: string;
  title: string;
  detail: string;
  titleJP: string;
  detailJP: string;
  progress: number | null;
  dueDate: Date | null;
};

export type AddReportDialogProps = {
  triggerLabel?: string;
  projects: { id: string; label: string }[];
  tasks: { id: string; label: string }[];
  defaultOpen?: boolean;
  t?: (key: string) => string;
  onSuccess?: () => void;
  onClose?: () => void;
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
  triggerLabel = "Add report",
  projects,
  tasks,
  onClose,
  defaultOpen,
  t = (s) => s,
  onSuccess,
}: AddReportDialogProps) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("Add Report")}</DialogTitle>
          <DialogDescription>
            {t("Fill in the task details and save.")}
          </DialogDescription>
        </DialogHeader>

        <Formik<FormValues>
          initialValues={{
            reportDate: new Date(),
            project_id: "all",
            task_id: "all",
            title: "",
            detail: "",
            titleJP: "",
            detailJP: "",
            progress: null,
            dueDate: null,
          }}
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
              // await createMutation.mutateAsync(payload);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form className="flex-col space-y-4">
              <div className="w-48 flex justify-self-end">
                <DatePicker
                  value={values.reportDate}
                  onChange={(date) => setFieldValue("reportDate", date)}
                />
              </div>
              <div className="sm:flex justify-between space-x-5 space-y-3">
                <div className="space-y-1 w-full sm:w-1/2">
                  <label
                    htmlFor="project_id"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Project
                  </label>

                  <Selected
                    value={values.project_id}
                    triggerClassName="w-full"
                    placeholder="Project"
                    options={projects}
                    onChange={(id) => setFieldValue("project_id", id)}
                  />
                </div>
                <div className="space-y-1 w-full sm:w-1/2">
                  <label
                    htmlFor="project_id"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Task
                  </label>

                  <Selected
                    value={values.task_id}
                    placeholder="Task"
                    triggerClassName="w-full"
                    options={tasks}
                    onChange={(id) => setFieldValue("task_id", id)}
                  />
                </div>
              </div>
              <div className="flex-col bg-[#f4fafd] rounded-lg p-4">
                <div className="flex justify-self-end">
                  <Tabs defaultValue="1" className="w-full">
                    <TabsList>
                      <TabsTrigger value="1">Default</TabsTrigger>
                      <TabsTrigger value="2">JP</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Title
                  </label>
                  <Field name="title">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <Input
                        {...field}
                        placeholder={t("Common.title")}
                        className="w-full mb-2 bg-white"
                        type="text"
                      />
                    )}
                  </Field>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Description
                  </label>
                  <Field name="description">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <Textarea
                        {...field}
                        placeholder={t("Common.description")}
                        className="w-full mb-4 bg-white"
                        rows={10}
                        cols={5}
                      />
                    )}
                  </Field>
                </div>
              </div>
              <div className="sm:flex justify-between space-x-5 space-y-2">
                <div className="w-full sm:w-1/2 space-y-1">
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Progress
                  </label>
                  <Field name="progress">
                    {({ field }: { field: FieldInputProps<number | null> }) => (
                      <div className="w-full">
                        <Input
                          name={field.name}
                          onBlur={field.onBlur}
                          value={field.value ?? ""}
                          placeholder={`${t("Common.progress")} (%)`}
                          className="w-full mb-2"
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
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Due date
                  </label>
                  <DatePicker
                    value={values.dueDate}
                    placeholder="Pick a due date"
                    onChange={(date) => setFieldValue("dueDate", date)}
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    {t("Cancel")}
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("Saving...") : t("Save")}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
