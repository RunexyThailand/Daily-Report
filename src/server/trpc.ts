// server/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { prisma } from "@/server/db";
import { getAuth } from "@/server/auth";

// ---------- Context ----------
export type TRPCContext = {
  prisma: typeof prisma;
  session: Awaited<ReturnType<typeof getAuth>>; // { user?: ... } | null
};

export async function createTRPCContext(): Promise<TRPCContext> {
  const session = await getAuth();
  return { prisma, session };
}

// ---------- tRPC init ----------
const t = initTRPC.context<TRPCContext>().create({
  // server-side ยังสามารถกำหนด transformer ได้
  transformer: superjson,
});

// ---------- Routers & Procedures ----------
export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next();
});
