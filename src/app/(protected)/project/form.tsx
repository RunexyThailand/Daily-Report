"use client";

import { createProject, updateProject } from "@/actions/project";
import { Formik, Form, Field } from "formik";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { Prisma } from "@prisma/client";

type ProjectType = Prisma.ProjectGetPayload<{}>;

const ProjectForm = ({
  onSuccess,
  project,
  flash = false,
  setProject,
}: {
  onSuccess: () => void;
  project: ProjectType | null;
  setProject: (project: ProjectType | null) => void;
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
          initialValues={{ name: project ? project.name : "" }}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setIsLoading(true);
            try {
              if (project) {
                await updateProject({ id: project.id, name: values.name });
              } else {
                await createProject(values);
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
                {t("ProjectPage.name")}
              </label>
              <Field
                id="name"
                name="name"
                placeholder={t("ProjectPage.enterprojectname")}
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
                {isSubmitting ? t("Common.submitting") : t("ProjectPage.submit")}
              </button>
              {project && (
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                  onClick={() => setProject(null)}   
                >
                  {t("ProjectPage.canceledit")}
                </button>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProjectForm;
