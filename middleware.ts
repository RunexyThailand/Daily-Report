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
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icons|images|assets|fonts|uploads|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt)).*)",
    "/protected/:path*", // ป้องกัน /protected และ subpath
    "/admin/:path*", // ป้องกัน /admin
    "/settings/:path*", // ป้องกัน /settings
  ],
};
