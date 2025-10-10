import { router, publicProcedure } from "@/server/trpc";
import { Language, Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { reportInputSchema } from "./types";
import * as z from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function sanitizeName(name: string) {
  return name.replace(/[^a-z0-9.\-_]/gi, "_");
}

function parseDataUrl(dataUrl: string) {
  const m = dataUrl.match(/^data:(image\/[a-z0-9+\-\.]+);base64,(.+)$/i);
  if (!m) throw new Error("Invalid data URL");
  const mime = m[1];
  const base64 = m[2];
  const buffer = Buffer.from(base64, "base64");
  const ext =
    mime === "image/svg+xml"
      ? "svg"
      : mime === "image/png"
        ? "png"
        : mime === "image/jpeg"
          ? "jpg"
          : mime === "image/webp"
            ? "webp"
            : mime === "image/gif"
              ? "gif"
              : "bin";
  return { buffer, mime, ext };
}

export const appRouter = router({
  uploadImageToLocal: publicProcedure
    .input(
      z.object({
        dataUrl: z.string().min(10),
        filename: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { buffer, ext } = parseDataUrl(input.dataUrl);
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const safe = sanitizeName(input.filename ?? `image.${ext}`);
      const name = `${Date.now()}_${safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`}`;
      const filePath = path.join(uploadsDir, name);

      await writeFile(filePath, buffer);
      return { url: `/uploads/${name}` }; // เสิร์ฟได้ทันที
    }),
  getUserReport: publicProcedure
    .input(
      z.object({
        userId: z.string().nullable(),
        lang: z.string().default("en"),
        taskId: z.string().nullable().optional(),
        projectId: z.string().nullable().optional(),
        from: z.string().nullable().optional(),
        to: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = DateTime.now();
      const startToday = now.startOf("day").toString();
      const endToday = now.endOf("day").toString();
      const dateGte = input.from ? input.from : startToday;
      const dateLte = input.to ? input.to : endToday;
      const reportWhere: Prisma.ReportWhereInput = {
        ...(input.taskId !== "" ? { task_id: input.taskId } : {}),
        ...(input.projectId !== "" ? { project_id: input.projectId } : {}),
        created_at: { gte: dateGte, lte: dateLte },
      };
      const userWhere: Prisma.UserWhereInput = {
        ...(input.userId ? { id: input.userId } : {}),
        reports: { some: reportWhere },
      };
      const users = await ctx.prisma.user.findMany({
        where: userWhere,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          reports: {
            where: reportWhere,
            orderBy: { report_date: "desc" },
            select: {
              id: true,
              report_date: true,
              progress: true,
              due_date: true,
              report_trans: {
                where: { language: input.lang as Language },
                select: { title: true, detail: true },
                take: 1,
              },
              task: { select: { name: true } },
              project: { select: { name: true } },
              created_by: true,
            },
          },
        },
      });

      const result = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        reports: u.reports.map((r) => ({
          report_id: r.id,
          report_date: r.report_date,
          progress: r.progress ?? null,
          due_date: r.due_date ?? null,
          title: r.report_trans[0]?.title ?? null,
          detail: r.report_trans[0]?.detail ?? null,
          task_name: r.task?.name ?? null,
          project_name: r.project?.name ?? null,
          created_by: r.created_by,
        })),
      }));

      return { users: result };
    }),
  getUsers: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany();
    return { users };
  }),
  getTasks: publicProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.prisma.task.findMany();
    return { tasks };
  }),

  getProjects: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany();
    return { projects };
  }),
  getReportById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const reportId = input;
      const report = await ctx.prisma.report.findFirst({
        include: {
          report_trans: true,
        },
        where: { id: reportId },
      });
      return report;
    }),
  createReport: publicProcedure
    .input(reportInputSchema)
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.create({
        data: {
          project_id: input.project_id,
          task_id: input.task_id,
          report_date: input.report_date,
          progress: input.progress,
          due_date: input.due_date,
          created_by: ctx.session?.user.id ?? "",
          report_trans: {
            create: input.report_trans,
          },
        },
      });
      return report;
    }),
  deleteReport: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const reportId = input;
      await ctx.prisma.report_trans.deleteMany({
        where: {
          report_id: reportId,
        },
      });
      await ctx.prisma.report.delete({
        where: { id: reportId },
      });
    }),
});

// type สำหรับ client
export type AppRouter = typeof appRouter;
