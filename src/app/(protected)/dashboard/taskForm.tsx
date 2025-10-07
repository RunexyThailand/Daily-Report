import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus } from "lucide-react";
import DialogTask from "@/components/dialogTask";

const TaskForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        className="fixed bottom-6 right-6 rounded-full bg-green-500 hover:bg-green-600 text-white w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer"
        size="icon"
        aria-label="Add"
        onClick={() => setIsOpen(true)}
      >
        <Plus size={32} />
      </Button>
      <DialogTask isOpen={isOpen} onClose={() => setIsOpen(false)} mode="ADD" />
    </>
  );
};

export default TaskForm;
