import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import superjson from "superjson";
import { prisma } from "@/server/db";
// ถ้าต้อง auth แบบ Next ให้ทำเฉพาะ HTTP เท่านั้น
import { getAuthFromNext, getAuthFromToken } from "@/server/auth";

type Session = { user?: { id: string; email?: string } } | null;
export type TRPCContext = { prisma: typeof prisma; session: Session };

function isHttp(o: unknown): o is FetchCreateContextFnOptions {
  return !!o && typeof o === "object" && "req" in (o as any);
}
function isWs(o: unknown): o is CreateWSSContextFnOptions {
  return !!o && typeof o === "object" && "info" in (o as any);
}

export async function createTRPCContext(
  opts?: FetchCreateContextFnOptions | CreateWSSContextFnOptions,
): Promise<TRPCContext> {
  if (isHttp(opts)) {
    // ✅ HTTP เท่านั้นที่อนุญาตให้แตะ next/headers ผ่าน getAuthFromNext()
    const session = await getAuthFromNext();
    return { prisma, session };
  }
  if (isWs(opts)) {
    // ✅ WS: ดึง token จาก connectionParams เท่านั้น
    const params = (opts.info.connectionParams ?? {}) as { authToken?: string };
    const session = await getAuthFromToken(params.authToken);
    return { prisma, session };
  }
  // fallback (กรณีอื่น ๆ)
  return { prisma, session: null };
}

const t = initTRPC.context<TRPCContext>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next();
});
