"use server";

import TaskClient from "./client";

const TaskPage = async () => {
  return (
    <div>
      <TaskClient />
    </div>
  );
};

export default TaskPage;
