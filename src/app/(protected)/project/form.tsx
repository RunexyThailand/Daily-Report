"use client";

import { createProject } from "@/actions/project";
import { Formik, Form, Field } from "formik";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";

const ProjectForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  return (
    <div className="flex items-center justify-center mt-5">
      <div className="bg-white p-8 rounded shadow-md w-[75vw] relative">
        {isLoading && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/70">
            <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
          </div>
        )}
        <Formik
          validationSchema={Yup.object({
            name: Yup.string().required(t("Validation.isRequired")),
          })}
          initialValues={{ name: "" }}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setIsLoading(true);
            try {
              await createProject(values);
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
                Project Name
              </label>
              <Field
                id="name"
                name="name"
                placeholder="Enter project name"
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
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProjectForm;
