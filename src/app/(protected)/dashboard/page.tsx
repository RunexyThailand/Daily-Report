"use client"; // 👈 ต้องประกาศว่าเป็น Client Component

import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("DailyReportPage");
  return (
    <div className="text-red-500">
      <h1>{t("title")}</h1>
    </div>
  );
}
