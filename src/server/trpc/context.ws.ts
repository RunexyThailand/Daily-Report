// src/server/trpc/context.ws.ts
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { TRPCContext } from "@/server/trpc"; // ⬅️ นี่สำคัญ! (ไม่ใช่ "./context")
import { prisma } from "@/server/db";

export async function createWSContext(
  _opts: CreateWSSContextFnOptions,
): Promise<TRPCContext> {
  return { prisma, session: null };
}
