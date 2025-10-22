"use server";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";

export const createProject = async (formData: { name: string }) => {
  try {
    // throw new Error("Simulated error for testing purposes");
    const caller = appRouter.createCaller(await createTRPCContext());
    const result = await caller.createProject(formData);
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateProject = async (formData: {
  id: string;
  name?: string;
  is_active?: boolean;
}) => {
  try {
    const caller = appRouter.createCaller(await createTRPCContext());
    const result = await caller.updateProject(formData);
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    // throw new Error("Simulated error for testing purposes");
    const caller = appRouter.createCaller(await createTRPCContext());
    const projectIsUsed = await caller.checkProjectIsUsed(projectId);
    let result = null;
    if (projectIsUsed) {
      result = await caller.updateProject({
        id: projectId,
        softDelete: true,
      });
    } else {
      result = await caller.deleteProject({ projectId });
    }
    return result;
  } catch (error) {
    throw error;
  }
};
