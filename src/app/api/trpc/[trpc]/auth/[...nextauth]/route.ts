import NextAuth from "next-auth";
import { authOptions } from "@/server/auth";

// ใช้ options จากไฟล์ส่วนกลาง เพื่อให้ getServerSession() reuse ได้
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
