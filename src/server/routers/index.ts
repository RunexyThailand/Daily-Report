import { router, publicProcedure, authedProcedure } from "@/server/trpc";
import { z } from "zod";

export const appRouter = router({
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

  // query ที่ต้อง auth ก่อนถึงจะใช้ได้
  me: authedProcedure.query(({ ctx }) => ({
    user: ctx.session?.user ?? null,
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
