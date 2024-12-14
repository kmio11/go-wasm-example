"use client";
import { Button } from "@/components/ui/button";
import { TaskList } from "./_components/task-list";
import { Plus } from "lucide-react";
import { useTasks } from "./_hooks/use-tasks";
import { useWasm } from "@/hooks/use-wasm";
import { ImportTasks } from "./_components/import-tasks";
import { Task } from "./_components/types";

export default function Page() {
  const { tasks, addTasks, upsertTasks, deleteTask, setTask } = useTasks([]);

  const todoWasm = useWasm("todoWasm", "/todo.wasm");

  const handleAddTask = () => {
    addTasks([{ title: "New Task", completed: false }]);
  };

  const handleImportTasks = (tasks: Task[]) => {
    upsertTasks(tasks);
  };

  if (!todoWasm) {
    return "Loading...";
  }

  return (
    <div className="p-12 space-y-4">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        ToDo:
      </h2>
      <div className="px-4 w-96 max-w-full space-y-4">
        <div className="border-b border-border flex justify-end">
          <ImportTasks
            onLoad={handleImportTasks}
            onLoadError={(e) => {
              console.error(e);
            }}
          />
        </div>
        <TaskList tasks={tasks} deleteTask={deleteTask} setTask={setTask} />
        <div className="w-full flex justify-end">
          <Button variant={"outline"} onClick={handleAddTask}>
            <Plus /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
