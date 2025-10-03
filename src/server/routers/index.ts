import { router, publicProcedure } from "@/server/trpc";
import { z } from "zod";

export const appRouter = router({
  getTasks: publicProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.prisma.task.findMany();
    return { tasks };
  }),
  // query ธรรมดา
  ping: publicProcedure.query(() => ({
    ok: true,
    now: Date.now(),
  })),

  // query ที่รับ input
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => ({
      message: `Hello ${input?.name ?? "world"}!`,
    })),

  // mutation ตัวอย่าง
  echo: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(({ input }) => ({
      text: input.text,
    })),
});

// type สำหรับ client
export type AppRouter = typeof appRouter;
