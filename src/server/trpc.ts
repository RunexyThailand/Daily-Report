// src/server/trpc.ts
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/server/auth";

// ---- Context ----
export type Context = {
  session: Session | null;
};

export async function createContext(): Promise<Context> {
  const session = await getServerSession(authOptions);
  return { session };
}

// ---- tRPC init ----
// v10 ใช้ transformer; ถ้า v11 ให้ใช้ dataTransformer
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    // คุณอาจใช้ TRPCError ก็ได้:
    // throw new TRPCError({ code: "UNAUTHORIZED" });
    throw new Error("UNAUTHORIZED");
  }
  return next({ ctx });
});
