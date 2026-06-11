import * as taskClient from "./client/taskClient";
import { AuthActionButton } from "./auth";
import type { TaskState } from "./domain/task";
import { TaskAppStateContext, type TaskAppContext, type TaskDraftFields } from "./taskAppState";
import "./styles.css";

export function TaskAppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const today = new Date().toISOString().slice(0, 10);

  async function addTask(input: TaskDraftFields) {
    await taskClient.createTask(input);
  }

  async function updateTask(taskId: string, fields: TaskDraftFields) {
    await taskClient.updateTask(taskId, fields);
  }

  async function moveTask(taskId: string, taskState: TaskState) {
    await taskClient.changeTaskState(taskId, taskState);
  }

  async function deleteTask(taskId: string) {
    const confirmed = window.confirm("Delete this task permanently? This cannot be undone.");
    if (confirmed) {
      await taskClient.deleteTask(taskId);
    }
  }

  const context: TaskAppContext = {
    addTask,
    listArchivedTasks: taskClient.listArchivedTasks,
    listMainViewTasks: taskClient.listMainViewTasks,
    updateTask,
    moveTask,
    deleteTask,
    today,
  };

  return (
    <TaskAppStateContext.Provider value={context}>
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-4 flex justify-end">
          <AuthActionButton
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-rule bg-surface px-4 text-sm font-semibold text-ink"
            intent="sign-out"
          >
            Sign out
          </AuthActionButton>
        </div>
        {children}
      </main>
    </TaskAppStateContext.Provider>
  );
}
