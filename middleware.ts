import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // This function will only be called if the user is authenticated
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page and API routes without authentication
        if (
          req.nextUrl.pathname.startsWith("/login") ||
          req.nextUrl.pathname.startsWith("/api/auth")
        ) {
          return true;
        }
        // For protected routes, require a token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

// ระบุเส้นทางที่ต้องการป้องกัน
export const config = {
  matcher: [
    "/protected/:path*", // ป้องกัน /protected และ subpath
    "/admin/:path*", // ป้องกัน /admin
    "/settings/:path*", // ป้องกัน /settings
  ],
};
