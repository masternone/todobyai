import React, { useEffect, useState } from "react";
import * as taskClient from "./client/taskClient";
import type { TaskState } from "./domain/task";
import { TaskAppStateContext, type TaskAppContext, type TaskDraftFields } from "./taskAppState";
import { TaskSurface } from "./taskSurface";
import "./styles.css";

export function TaskAppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [tasks, setTasks] = useState<TaskAppContext["tasks"]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "failed">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        const loadedTasks = await taskClient.listTasks();
        if (!cancelled) {
          setTasks(loadedTasks);
          setLoadState("loaded");
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadState("failed");
          setErrorMessage(error instanceof Error ? error.message : "Could not load tasks.");
        }
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  async function addTask(input: TaskDraftFields) {
    const task = await taskClient.createTask(input);
    setTasks((current) => [task, ...current]);
  }

  async function updateTask(taskId: string, fields: TaskDraftFields) {
    const updatedTask = await taskClient.updateTask(taskId, fields);
    setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
  }

  async function moveTask(taskId: string, taskState: TaskState) {
    const updatedTask = await taskClient.changeTaskState(taskId, taskState);
    setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
  }

  async function deleteTask(taskId: string) {
    const confirmed = window.confirm("Delete this task permanently? This cannot be undone.");
    if (confirmed) {
      await taskClient.deleteTask(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    }
  }

  const context: TaskAppContext = {
    tasks,
    isLoadingTasks: loadState === "loading",
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    today,
  };

  return (
    <TaskAppStateContext.Provider value={context}>
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        {loadState === "failed" ? (
          <p className="py-8 text-danger">{errorMessage ?? "Could not load tasks."}</p>
        ) : null}
        {loadState !== "failed" ? children : null}
      </main>
    </TaskAppStateContext.Provider>
  );
}

export function MainViewRoute() {
  return <TaskSurface view="Main View" />;
}

export function ArchiveViewRoute() {
  return <TaskSurface view="Archived View" />;
}
