"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session) {
      // User is logged in, redirect to protected area
      router.replace("/protected/report");
    } else {
      // User is not logged in, redirect to login
      router.replace("/login");
    }
  }, [session, status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    </main>
  );
}
