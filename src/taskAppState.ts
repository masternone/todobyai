import React from "react";
import type { MainViewTasks, Task, TaskFilter, TaskSort, TaskState } from "./domain/task";

export type TaskDraftFields = { title: string; note: string; dueDate: string };

export type TaskAppContext = {
  addTask: (input: TaskDraftFields) => Promise<void>;
  listArchivedTasks: (input: { sort: TaskSort }) => Promise<Task[]>;
  listMainViewTasks: (input: {
    filter: TaskFilter;
    sort: TaskSort;
    today: string;
  }) => Promise<MainViewTasks>;
  updateTask: (taskId: string, fields: TaskDraftFields) => Promise<void>;
  moveTask: (taskId: string, taskState: TaskState) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  today: string;
};

export const TaskAppStateContext = React.createContext<TaskAppContext | null>(null);

export function useTaskAppState(): TaskAppContext {
  const context = React.useContext(TaskAppStateContext);
  if (!context) {
    throw new Error("Task app state is only available inside TaskAppShell.");
  }
  return context;
}
