// server/routers/types.ts
import { z } from "zod";

export const ReportItemSchema = z.object({
  report_id: z.string(),
  report_date: z.date().nullable(), // ถ้าใช้ superjson, Date ใช้ได้เลย
  progress: z.number().nullable(),
  due_date: z.date().nullable(),
  title: z.string().nullable(),
  detail: z.string().nullable(),
  task_name: z.string().nullable(),
  project_name: z.string().nullable(),
});

export const UserWithReportsSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  image: z.string().nullable(),
  reports: z.array(ReportItemSchema),
});

export type ReportItem = z.infer<typeof ReportItemSchema>;
export type UserWithReports = z.infer<typeof UserWithReportsSchema>;
