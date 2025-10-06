import { DefaultSession } from "next-auth";

// เพิ่ม field ให้ Session.user
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // ⭐ เพิ่ม id ใน session.user
    } & DefaultSession["user"];
  }

  // ให้ User ที่ authorize() return กลับมา มี id ชัดเจน
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

// เพิ่ม field ให้ JWT
declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
  }
}
