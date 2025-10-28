"use server";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";

type UpdateUserInput = {
  name: string;
  currentPassword?: string;
  newPassword?: string;
};

export const updateUser = async (formData: UpdateUserInput) => {
  try {
    // throw new Error("Simulated error for testing purposes");
    const caller = appRouter.createCaller(await createTRPCContext());
    const result = await caller.userRouter.updateUser(formData);
    return result;
  } catch (error) {
    throw error;
  }
};
