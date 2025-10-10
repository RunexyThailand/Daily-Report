"use client";

import { LayoutProvider } from "@/components/layout/layout-provider";
// import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar-layout";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export default function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <LayoutProvider>
        <div className="flex min-h-dvh">
          {/* <Sidebar /> */}
          <div className="flex flex-1 flex-col">
            <Topbar />
            <main className="flex-1 overflow-auto p-4 lg:p-6">
              <div className="mx-auto">{children}</div>
            </main>
            <Toaster position="top-right" richColors />
          </div>
        </div>
      </LayoutProvider>
    </SessionProvider>
  );
}
