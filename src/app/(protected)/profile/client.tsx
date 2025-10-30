"use client";
import { Field, Form, Formik } from "formik";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { useSession } from "next-auth/react";
import { updateUser } from "@/actions/user";

const ProfileClient = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  return (
    <>
      <div className="flex items-center justify-center mt-5">
        <div
          className={`p-8 rounded shadow-md w-[75vw] relative transition-colors`}
        >
          {isLoading && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/70">
              <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
            </div>
          )}
          <h2 className="text-xl font-bold mb-4">{t("Common.YourAccount")}</h2>
          <Formik
            enableReinitialize={true}
            validationSchema={Yup.object({
              name: Yup.string().required(
                t("Validation.isRequired") ?? "Required",
              ),
              currentPassword: Yup.string().optional(),
              newPassword: Yup.string()
                .min(
                  8,
                  t("Validation.minLength", { count: 8 }) ??
                    "Minimum 8 characters",
                )
                .when("currentPassword", {
                  is: (val: string) => !!val,
                  then: (schema) =>
                    schema.required(t("Validation.isRequired") ?? "Required"),
                  otherwise: (schema) => schema.optional(),
                }),
              confirmPassword: Yup.string().when("newPassword", {
                is: (val: string) => !!val,
                then: (schema) =>
                  schema
                    .oneOf(
                      [Yup.ref("newPassword")],
                      t("Validation.passwordMatch") ?? "Passwords must match",
                    )
                    .required(t("Validation.isRequired") ?? "Required"),
                otherwise: (schema) => schema.optional(),
              }),
            })}
            initialValues={{
              email: session?.user?.email ?? "",
              name: session?.user?.name ?? "",
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            onSubmit={async (values, { setSubmitting }) => {
              setIsLoading(true);
              try {
                await updateUser(values);
                toast.success(
                  `${t(`Common.save`)} ${t(`ResponseStatus.success`)}`,
                );
                window.location.reload();
              } catch (err) {
                toast.error(
                  `${t(`Common.save`)} ${t(`ResponseStatus.error`)}`,
                  {
                    description:
                      err instanceof Error ? err.message : "Unknown error",
                  },
                );
              } finally {
                setIsLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="flex flex-col gap-4 relative items-center">
                {/* Each field on its own line, width 75% of the card */}
                <div className="w-3/4">
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Field
                    disabled
                    name="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                  />
                </div>

                <div className="w-3/4">
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Field name="name">
                    {({ field }: any) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                        placeholder="Your name"
                        disabled={status === "loading"}
                      />
                    )}
                  </Field>
                  {errors.name && touched.name && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="w-3/4">
                  <label className="block text-sm font-medium mb-1">
                    Current Password
                  </label>
                  <Field name="currentPassword">
                    {({ field }: any) => (
                      <input
                        {...field}
                        type="password"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Current password"
                      />
                    )}
                  </Field>
                  {errors.currentPassword && touched.currentPassword && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.currentPassword}
                    </div>
                  )}
                </div>

                <div className="w-3/4">
                  <label className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <Field name="newPassword">
                    {({ field }: any) => (
                      <input
                        {...field}
                        type="password"
                        className="w-full border rounded px-3 py-2"
                        placeholder="New password"
                      />
                    )}
                  </Field>
                  {errors.newPassword && touched.newPassword && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.newPassword}
                    </div>
                  )}
                </div>

                <div className="w-3/4">
                  <label className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <Field name="confirmPassword">
                    {({ field }: any) => (
                      <input
                        {...field}
                        type="password"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Confirm new password"
                      />
                    )}
                  </Field>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className="w-3/4 flex justify-end gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isSubmitting ? t("Common.Saving") : t("Common.Saveprofile")}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default ProfileClient;
