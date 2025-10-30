// src/server/trpc/context.http.ts
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { TRPCContext } from "./context";
import { prisma } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";

export async function createHTTPContext(
  opts: CreateNextContextOptions,
): Promise<TRPCContext> {
  const session = await getServerAuthSession(opts.req, opts.res); // Session | null
  return { prisma, session };
}
