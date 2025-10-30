// src/server/trpc/context.ts
import type { Session } from "next-auth";
import { prisma } from "@/server/db";

export type TRPCContext = {
  prisma: typeof prisma;
  session: Session | null; // <-- must be nullable here
};
