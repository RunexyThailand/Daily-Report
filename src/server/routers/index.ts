import { router, publicProcedure } from "@/server/trpc";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { reportInputSchema } from "./types";
import * as z from "zod";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { translateRouter } from "./translate";
import {
  createReportService,
  updateReportService,
} from "../services/report.service";

function sanitizeName(name: string) {
  return name.replace(/[^a-z0-9.\-_]/gi, "_");
}

const MIME_TO_EXT: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function mimeToExt(mime: string, fallback = "bin"): string {
  const clean = mime.toLowerCase().split(";")[0].trim();
  return MIME_TO_EXT[clean] ?? fallback;
}

function parseDataUrl(dataUrl: string) {
  const m = dataUrl.match(/^data:(image\/[a-z0-9+\-\.]+);base64,(.+)$/i);
  if (!m) throw new Error("Invalid data URL");
  const mime = m[1];
  const base64 = m[2];
  const buffer = Buffer.from(base64, "base64");
  const ext = mimeToExt(mime);

  return { buffer, mime, ext };
}

function getUploadBaseDir() {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  return fromEnv && fromEnv.length > 0
    ? fromEnv
    : path.join(process.cwd(), "uploads");
}

export const appRouter = router({
  translate: translateRouter,
  uploadImageToLocal: publicProcedure
    .input(
      z.object({
        dataUrl: z.string().min(10),
        filename: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { buffer, ext } = parseDataUrl(input.dataUrl);
      const uploadsDir = getUploadBaseDir();

      await mkdir(uploadsDir, { recursive: true });

      const safe = sanitizeName(input.filename ?? `image.${ext}`);
      const name = `${Date.now()}_${safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`}`;
      const filePath = path.join(uploadsDir, name);

      await writeFile(filePath, buffer);
      return { url: `/uploads/${name}` };
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
        report_date: { gte: dateGte, lte: dateLte },
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
                select: { language: true, title: true, detail: true },
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
        reports: u.reports.map((r) => {
          return {
            report_id: r.id,
            report_date: r.report_date,
            progress: r.progress ?? null,
            due_date: r.due_date ?? null,
            translates: r.report_trans,
            task_name: r.task?.name ?? null,
            project_name: r.project?.name ?? null,
            created_by: r.created_by,
          };
        }),
      }));

      return { users: result };
    }),
  getUsers: publicProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.prisma.user.findMany();
      return { users };
    } catch (err) {
      console.log("🚀 ~ err:", err);
    }
  }),

  getTasks: publicProcedure.query(async ({ ctx }) => {
    try {
      const tasks = await ctx.prisma.task.findMany();
      return { tasks };
    } catch (err) {
      console.log("🚀 ~ err:", err);
    }
  }),

  getProjects: publicProcedure
    .input(
      z
        .object({
          onlyActive: z.boolean(),
        })
        .default({ onlyActive: true })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const projectWhere = {
        deleted_at: null,
      };

      if (input?.onlyActive) {
        Object.assign(projectWhere, { is_active: true });
      }
      try {
        const projects = await ctx.prisma.project.findMany({
          where: projectWhere,
        });
        return { projects };
      } catch (err) {
        console.log("🚀 ~ err:", err);
      }
    }),
  getReportById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const reportId = input;
      const report = await ctx.prisma.report.findFirst({
        include: {
          report_trans: {
            select: { language: true, title: true, detail: true },
          },
        },
        where: { id: reportId },
      });
      return report;
    }),
  checkProjectIsUsed: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const projectId = input;
      const report = await ctx.prisma.report.findFirst({
        where: { project_id: projectId },
      });
      return report ? true : false;
    }),
  createReport: publicProcedure
    .input(reportInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id ?? "";
      return createReportService(ctx.prisma, input, userId);
    }),
  updateReport: publicProcedure
    .input(reportInputSchema)
    .mutation(async ({ ctx, input }) => {
      const reportId = input.id || "";
      return updateReportService(ctx.prisma, reportId, input);
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
  createProject: publicProcedure
    .input(z.object({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.create({
        data: {
          name: input.name,
          created_by: ctx.session?.user.id || "",
        },
      });
      return project;
    }),
  updateProject: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(255).optional(),
        is_active: z.boolean().optional(),
        softDelete: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data: Prisma.ProjectUpdateInput = {};
      if (typeof input.name !== "undefined") data.name = input.name;
      if (typeof input.is_active !== "undefined")
        data.is_active = input.is_active;
      if (input.softDelete) {
        data.deleted_at = new Date();
        data.deleted_by = ctx.session?.user.id || "";
      }
      const project = await ctx.prisma.project.update({
        where: { id: input.id },
        data,
      });
      return project;
    }),
  deleteProject: publicProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;
      await ctx.prisma.project.delete({
        where: { id: projectId },
      });
    }),
});

// type สำหรับ client
export type AppRouter = typeof appRouter;
