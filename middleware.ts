// middleware.ts (วางไว้ที่รากโปรเจกต์ ข้าง package.json)
export { default } from "next-auth/middleware";

// ระบุเส้นทางที่ต้องการป้องกัน
export const config = {
  matcher: [
    "/", // ✅ ป้องกันหน้า root
    "/report/:path*", // ป้องกัน /report และ subpath
    "/admin/:path*", // ป้องกัน /admin
    "/settings/:path*", // ป้องกัน /settings
  ],
};
