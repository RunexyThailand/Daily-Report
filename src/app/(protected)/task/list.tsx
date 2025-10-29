import { Prisma } from "@prisma/client";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type TaskType = Prisma.TaskGetPayload<{}>;

const TaskList = ({
  tasks,
  onEdit,
  onDelete,
  toggleActive,
}: {
  tasks: TaskType[];
  onEdit: (task: TaskType) => void;
  onDelete: (taskId: string) => void;
  toggleActive: (taskId: string, tobe: boolean) => void;
}) => {
  const t = useTranslations();
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">

        {t("Project-Task.List")}

      </h2>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="border rounded px-4 py-2 flex justify-between items-center"
          >
            <span>{task.name}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(task)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                title="show/no show"
                variant={"outline"}
                onClick={() => toggleActive(task.id, !task.is_active)}
              >
                {task.is_active ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
