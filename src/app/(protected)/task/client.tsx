"use client";
import { deleteTask, updateTask } from "@/actions/task";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { Prisma } from "@prisma/client";
import DialogConfirm from "@/components/dialog/dialog-confirm";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import TaskList from "./list";
import TaskForm from "./form";
import { useTranslations } from "next-intl";

type TaskType = Prisma.TaskGetPayload<Prisma.TaskCreateArgs>;

const TaskClient = () => {
  const {
    data: taskQuery,
    refetch,
    isFetching,
  } = trpc.getTasks.useQuery({ onlyActive: false });
  const [flash, setFlash] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskId, setTaskId] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const handleDelete = async (taskId: string) => {
    setIsLoading(true);
    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully");
      await refetch();
    } catch (err) {
      toast.error(`${t(`Common.delete`)} ${t(`ResponseStatus.error`)}`, {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleEdit = (task: TaskType) => {
    try {
      setFlash(true);
      setIsLoading(true);
      setSelectedTask(task);
      setTimeout(() => setFlash(false), 800);
    } catch (err) {
      toast.error(`${t(`Common.update`)} ${t(`ResponseStatus.error`)}`, {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (taskId: string, tobe: boolean) => {
    try {
      setIsLoading(true);
      await updateTask({ id: taskId, is_active: tobe });
      await refetch();
    } catch (err) {
      toast.error(`${t(`Common.update`)} ${t(`ResponseStatus.error`)}`, {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <TaskForm
        flash={flash}
        onSuccess={() => {
          setSelectedTask(null);
          refetch();
        }}
        task={selectedTask}
        setTask={setSelectedTask}
      />
      <div className="relative">
        {(isLoading || isFetching) && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/70">
            <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
          </div>
        )}
        <TaskList
          tasks={taskQuery?.tasks ?? []}
          onDelete={(taskId) => {
            setTaskId(taskId);
            setShowConfirm(true);
          }}
          onEdit={handleEdit}
          toggleActive={handleToggleActive}
        />
      </div>
      <DialogConfirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => handleDelete(taskId)}
      />
    </div>
  );
};

export default TaskClient;
