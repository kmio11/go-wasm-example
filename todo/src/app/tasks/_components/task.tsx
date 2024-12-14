"use client";

import React, { useState } from "react";
import { Task } from "./types";
import { cn } from "@/lib/utils";
import { CircleCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "../_hooks/use-tasks";
import { Input } from "@/components/ui/input";

type TaskItemProps = {
  className?: string;
  task: Task;
  deleteTask: ReturnType<typeof useTasks>["deleteTask"];
  setTask: ReturnType<typeof useTasks>["setTask"];
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  className,
  deleteTask,
  setTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleComplete = () => {
    setTask(task.id, { completed: !task.completed });
  };

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (newTitle !== task.title) {
      setTask(task.id, { title: newTitle });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  return (
    <div
      className={cn(
        "border border-border p-2 flex items-center justify-start",
        className
      )}
    >
      <Button variant={"ghost"} size={"icon"} onClick={handleComplete}>
        <CircleCheck
          className={cn(
            "mr-2",
            "opacity-20",
            task.completed && "opacity-100 text-green-500"
          )}
        />
      </Button>
      {isEditing ? (
        <Input
          type="text"
          value={newTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="font-semibold truncate"
          placeholder="Task title"
          autoFocus
        />
      ) : (
        <div className="font-semibold truncate w-full" onClick={handleTitleClick}>
          {task.title}
        </div>
      )}
      <Button
        variant={"ghost"}
        size={"icon"}
        className="ml-auto"
        onClick={handleDelete}
      >
        <X />
      </Button>
    </div>
  );
};
