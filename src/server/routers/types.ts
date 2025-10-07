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

export const LanguageEnum = z.enum(["DEFAULT", "JP"]);

export const UserWithReportsSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  image: z.string().nullable(),
  reports: z.array(ReportItemSchema),
});

const reportTransSchema = z.object({
  language: LanguageEnum,
  title: z.string(),
  detail: z.string(),
});

export const reportInputSchema = z.object({
  project_id: z.string().nullable(),
  task_id: z.string().nullable(),
  report_date: z.date(),
  progress: z.number().nullable(),
  due_date: z.date().nullable(),
  report_trans: z.array(reportTransSchema),
});

export type ReportItem = z.infer<typeof ReportItemSchema>;
export type UserWithReports = z.infer<typeof UserWithReportsSchema>;
export type ReportInput = z.infer<typeof reportInputSchema>;
