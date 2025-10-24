"use server";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";

export const createTask = async (formData: { name: string }) => {
  try {
    // throw new Error("Simulated error for testing purposes");
    const caller = appRouter.createCaller(await createTRPCContext());
    const result = await caller.createTask(formData);
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (formData: {
  id: string;
  name?: string;
  is_active?: boolean;
}) => {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const result = await caller.updateTask(formData);
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    // throw new Error("Simulated error for testing purposes");
    const caller = appRouter.createCaller(await createTRPCContext());
    const taskIsUsed = await caller.checkTaskIsUsed(taskId);
    let result = null;
    if (taskIsUsed) {
      result = await caller.updateTask({
        id: taskId,
        softDelete: true,
      });
    } else {
      result = await caller.deleteTask({ taskId });
    }
    return result;
  } catch (error) {
    throw error;
  }
};
