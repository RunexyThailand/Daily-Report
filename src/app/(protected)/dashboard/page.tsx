import ReportFilter from "@/components/filters/report-filter";
import { prisma } from "@/server/db";
import { useTranslations } from "next-intl";

type ProjectDTO = { id: string; name: string };

export default async function DashboardPage() {
  const t = useTranslations("DailyReportPage");

  const projectsRaw = await prisma.project.findMany({
    select: { id: true, name: true }, // ส่งเฉพาะ field ที่ serialize ได้
    orderBy: { name: "asc" },
  });

  // กัน BigInt/ประเภทที่ serialize ไม่ได้: แปลง id → string
  const projects: ProjectDTO[] = projectsRaw.map((p: any) => ({
    id: String(p.id),
    name: p.name,
  }));

  return (
    <div>
      <h1>{t("title")}</h1>
      <div>
        <ReportFilter projects={projects} />
      </div>
    </div>
  );
}
