import { router, publicProcedure } from "@/server/trpc";
import { Language, Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { reportInputSchema } from "./types";
import * as z from "zod";

export const appRouter = router({
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
});

// type สำหรับ client
export type AppRouter = typeof appRouter;
