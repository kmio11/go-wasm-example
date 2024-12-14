"use client";

import React from "react";
import { Task } from "./types";
import { cn } from "@/lib/utils";
import { TaskItem } from "./task";
import { useTasks } from "../_hooks/use-tasks";

type TaskListProps = {
  className?: string;
  tasks: Task[];
  deleteTask: ReturnType<typeof useTasks>["deleteTask"];
  setTask: ReturnType<typeof useTasks>["setTask"];
};

export const TaskList: React.FC<TaskListProps> = ({
  className,
  tasks,
  ...taskItemProps
}) => {
  return (
    <ul className={cn("space-y-2", className)}>
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} {...taskItemProps} />
        </li>
      ))}
    </ul>
  );
};
