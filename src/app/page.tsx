"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {

      router.replace("/protected/report");
    } else {
      router.replace("/login");
    }
  }, [session, status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">{t('Common.loading')}</p>
      </div>
    </main>
  );
}
