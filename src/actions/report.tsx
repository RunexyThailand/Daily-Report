"use server";
import { appRouter } from "@/server/routers";
import { ReportInput } from "@/server/routers/types";
import { createTRPCContext } from "@/server/trpc";

export const createReport = async (formData: ReportInput) => {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const result = await caller.createReport(formData);
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteReport = async (reportId: string) => {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const result = await caller.deleteReport(reportId);
    return result;
  } catch (error) {
    throw error;
  }
};
