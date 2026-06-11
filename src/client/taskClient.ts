import { createServerFn } from "@tanstack/react-start";
import type {
  EditableTaskFields,
  MainViewTasks,
  Task,
  TaskFilter,
  TaskSort,
  TaskState,
} from "../domain/task";
import {
  listArchivedTasksForCurrentUser,
  listMainViewTasksForCurrentUser,
} from "../server/taskFunctions";
import { runTaskCommandForCurrentUser, type TaskCommand } from "../server/taskCommands";

const listMainViewTasksServerFn = createServerFn({ method: "GET" })
  .validator((input: { filter: TaskFilter; sort: TaskSort; today: string }) => input)
  .handler(async ({ data }) => {
    return listMainViewTasksForCurrentUser(data);
  });

const listArchivedTasksServerFn = createServerFn({ method: "GET" })
  .validator((input: { sort: TaskSort }) => input)
  .handler(async ({ data }) => {
    return listArchivedTasksForCurrentUser(data);
  });

const runTaskCommandServerFn = createServerFn({ method: "POST" })
  .validator((input: TaskCommand) => input)
  .handler(async ({ data }) => {
    return runTaskCommandForCurrentUser(data);
  });

export function listMainViewTasks(input: {
  filter: TaskFilter;
  sort: TaskSort;
  today: string;
}): Promise<MainViewTasks> {
  return listMainViewTasksServerFn({ data: input });
}

export function listArchivedTasks(input: { sort: TaskSort }): Promise<Task[]> {
  return listArchivedTasksServerFn({ data: input });
}

export function createTask(input: {
  title: string;
  note?: string | null;
  dueDate?: string | null;
}): Promise<Task> {
  return runTaskCommandServerFn({ data: { type: "Create Task", input } }).then(expectTask);
}

export function updateTask(taskId: string, fields: EditableTaskFields): Promise<Task> {
  return runTaskCommandServerFn({
    data: { type: "Update Task", taskId, fields },
  }).then(expectTask);
}

export function changeTaskState(taskId: string, taskState: TaskState): Promise<Task> {
  return runTaskCommandServerFn({
    data: { type: "Change Task State", taskId, taskState },
  }).then(expectTask);
}

export async function deleteTask(taskId: string): Promise<void> {
  await runTaskCommandServerFn({ data: { type: "Delete Task", taskId } });
}

function expectTask(task: Task | null): Task {
  if (!task) {
    throw new Error("Expected Task command to return a Task.");
  }
  return task;
}
