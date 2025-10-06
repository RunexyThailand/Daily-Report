import { router, publicProcedure } from "@/server/trpc";
import * as z from "zod";
export const appRouter = router({
  getUsers: publicProcedure
    .input(
      z.object({
        date: z.string().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: { reports: { some: {} } },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          reports: {
            where: {
              created_at: {
                gte: new Date("2025-10-03 00:00:00"),
                lte: new Date("2025-10-03 23:59:59"),
              },
            },
            orderBy: { report_date: "desc" },
            select: {
              id: true,
              report_date: true,
              progress: true,
              due_date: true,
              report_trans: {
                where: { language: "en" },
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
  getTasks: publicProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.prisma.task.findMany();
    return { tasks };
  }),

  getProjects: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany();
    return { projects };
  }),
});

// type สำหรับ client
export type AppRouter = typeof appRouter;
