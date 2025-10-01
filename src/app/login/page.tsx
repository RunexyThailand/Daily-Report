import { getAuth } from "@/server/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm"; // แยก form เป็น client component

export default async function LoginPage() {
  const session = await getAuth();

  // ถ้า login แล้ว → redirect ไป dashboard
  if (session?.user) {
    redirect("/protected/dashboard");
  }

  // ถ้ายังไม่ได้ login → แสดง form
  return <LoginForm />;
}
