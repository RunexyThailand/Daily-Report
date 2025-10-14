import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";
import ReportClient from "./report-client";

export default async function ReportPage() {
  const caller = appRouter.createCaller(await createTRPCContext());
  const [projectsData, tasksData, userData] = await Promise.all([
    caller.getProjects(),
    caller.getTasks(),
    caller.getUsers(),
  ]);

  const projects =
    projectsData?.projects.map((project) => ({
      id: String(project.id),
      label: project.name,
    })) ?? [];

  const tasks =
    tasksData?.tasks.map((task) => ({
      id: String(task.id),
      label: task.name,
    })) ?? [];

  const users =
    userData?.users.map((user) => ({
      id: String(user.id),
      label: user.name || "",
    })) ?? [];

  return (
    <div>
      <ReportClient projects={projects} tasks={tasks} users={users} />
    </div>
  );
}
