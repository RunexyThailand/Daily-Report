"use server";
import { appRouter } from "@/server/routers";
import { ReportInput } from "@/server/routers/types";
import { createTRPCContext } from "@/server/trpc";
import { revalidatePath } from "next/cache";

export const createReport = async (formData: ReportInput) => {
  const caller = appRouter.createCaller(await createTRPCContext());
  const result = await caller.createReport(formData);
  return result;
};
