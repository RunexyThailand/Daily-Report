"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LoginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Please enter your email"),
  password: Yup.string().required("Please enter your password"),
});

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="p-0 w-full max-w-2xl border-slate-200 dark:border-slate-800">
        <div className="flex">
          <div
            className="flex items-center px-5 rounded-l-xl"
            style={{ backgroundColor: "#234868" }}
          >
            <Image
              src="/logos/runexy-logo.png"
              alt="Runexy Logo"
              width={200}
              height={200}
              className="rounded-md"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-end w-full px-5 py-4 font-bold space-x-2">
              <Badge
                onClick={() => {
                  console.log("EN");
                }}
                variant="secondary"
                className="w-10 cursor-pointer"
                // style={{ backgroundColor: "#234868", color: "#ea330b" }}
                style={{ backgroundColor: "#ea330b", color: "#ffffff" }}
              >
                EN
              </Badge>
              <Badge
                variant="secondary"
                className="w-10 cursor-pointer"
                onClick={() => {
                  console.log("JP");
                }}
              >
                JP
              </Badge>
            </div>
            <div className="flex  flex-col items-center justify-center py-10 h-128">
              <CardContent className="w-full px-10">
                <Formik
                  initialValues={{ email: "", password: "" }}
                  validationSchema={LoginSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    setServerError(null);
                    const res = await signIn("credentials", {
                      redirect: false,
                      email: values.email,
                      password: values.password,
                    });
                    setSubmitting(false);

                    if (res?.ok) {
                      router.push("/protected/dashboard");
                    } else {
                      setServerError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                    }
                  }}
                >
                  {({ isSubmitting, handleChange, handleBlur, values }) => (
                    <Form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Field
                          as={Input}
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@runexy.co.th"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.email}
                          autoComplete="email"
                        />
                        <ErrorMessage
                          name="email"
                          component="p"
                          className="text-sm text-rose-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                        </div>
                        <Field
                          as={Input}
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.password}
                          autoComplete="current-password"
                        />
                        <ErrorMessage
                          name="password"
                          component="p"
                          className="text-sm text-rose-600"
                        />
                      </div>

                      {serverError && (
                        <div
                          role="alert"
                          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                        >
                          {serverError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </CardContent>

              <CardFooter className="justify-center">
                <p className="text-xs text-slate-500">
                  © {new Date().getFullYear()} Runexy. All rights reserved.
                </p>
              </CardFooter>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
