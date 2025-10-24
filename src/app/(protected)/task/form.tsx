"use client";

import { Formik, Form, Field } from "formik";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { Prisma } from "@prisma/client";
import { createTask, updateTask } from "@/actions/task";

type TaskType = Prisma.TaskGetPayload<{}>;

const TaskForm = ({
  onSuccess,
  task,
  setTask,
  flash = false,
}: {
  onSuccess: () => void;
  task: TaskType | null;
  setTask: (task: TaskType | null) => void;
  flash?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  return (
    <div className="flex items-center justify-center mt-5">
      <div
        className={`p-8 rounded shadow-md w-[75vw] relative transition-colors ${flash ? "bg-yellow-200/60 animate-pulse" : "bg-white"}`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/70">
            <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
          </div>
        )}
        <Formik
          enableReinitialize={true}
          validationSchema={Yup.object({
            name: Yup.string().required(t("Validation.isRequired")),
          })}
          initialValues={{ name: task ? task.name : "" }}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setIsLoading(true);
            try {
              if (task) {
                await updateTask({ id: task.id, name: values.name });
              } else {
                await createTask(values);
              }
              toast.success(
                `${t(`Common.save`)} ${t(`ResponseStatus.success`)}`,
              );
              resetForm();
              onSuccess();
            } catch (err) {
              toast.error(`${t(`Common.save`)} ${t(`ResponseStatus.error`)}`);
            } finally {
              setIsLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="flex items-center gap-4 relative">
              <label htmlFor="name" className="font-medium">
                Task Name
              </label>
              <Field
                id="name"
                name="name"
                placeholder="Enter task name"
                className="border rounded px-3 py-2"
              />
              {touched.name && errors.name && (
                <p className="text-sm text-destructive">
                  {String(errors.name)}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
              {task && (
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                  onClick={() => setTask(null)}
                >
                  Cancel edit
                </button>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default TaskForm;
