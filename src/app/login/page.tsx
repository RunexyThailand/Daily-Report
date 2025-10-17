import { getAuth } from "@/server/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form"; // แยก form เป็น client component
import { Metadata } from "next";
// import { getMessages } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // const messages = await getMessages({ locale });

  return {
    title: "messages.LoginPage.title",
    description: "messages.LoginPage.description",
  };
}

export default async function LoginPage() {
  const session = await getAuth();

  // ถ้า login แล้ว → redirect ไป report
  if (session?.user) {
    redirect("/report");
  }

  // ถ้ายังไม่ได้ login → แสดง form
  return <LoginForm />;
}
