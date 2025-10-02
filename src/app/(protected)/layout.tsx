import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";
import ProtectedShell from "./protected-shell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  // ใช้ Shell ฝั่ง client เพื่อจัด responsive + context
  return <ProtectedShell>{children}</ProtectedShell>;
}
