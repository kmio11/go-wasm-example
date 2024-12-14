"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWasm } from "@/hooks/use-wasm";
import { cn } from "@/lib/utils";
import { Import } from "lucide-react";
import React, { useState } from "react";
import { Task } from "./types";

type ImportTasksProps = {
  className?: string;
  onLoad?: (tasks: Task[]) => void;
  onLoadError?: (e: Error) => void;
};

export const ImportTasks: React.FC<ImportTasksProps> = ({
  className,
  onLoad,
  onLoadError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const todoWasm = useWasm("todoWasm", "/todo.wasm");

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setSelectedFile(event?.target?.files?.[0]);
  };

  const handleImport = async () => {
    if (!selectedFile || !todoWasm) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        const result = await todoWasm.importCsv(bytes);
        if (!result.ok) {
          onLoadError?.(new Error(result.message));
          return;
        }

        const tasks = JSON.parse(result.data);
        setSelectedFile(undefined);
        onLoad?.(tasks);
      } catch (e) {
        if (e instanceof Error) {
          onLoadError?.(e);
          return;
        }
        onLoadError?.(new Error("An error occurred while importing tasks"));
      }
    };
    fileReader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="flex items-end">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file">Import CSV file</Label>
        <Input
          id="file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>
      <Button
        variant={"outline"}
        className={cn(className)}
        onClick={handleImport}
        disabled={selectedFile === undefined}
      >
        <Import />
      </Button>
    </div>
  );
};
