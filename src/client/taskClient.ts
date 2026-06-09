import { createServerFn } from "@tanstack/react-start";
import type { EditableTaskFields, Task, TaskState } from "../domain/task";
import {
  changeTaskStateForCurrentUser,
  createTaskForCurrentUser,
  deleteTaskForCurrentUser,
  listTasksForCurrentUser,
  updateTaskForCurrentUser,
} from "../server/taskFunctions";

const listTasksServerFn = createServerFn({ method: "GET" }).handler(async () => {
  return listTasksForCurrentUser();
});

const createTaskServerFn = createServerFn({ method: "POST" })
  .validator((input: { title: string; note?: string | null; dueDate?: string | null }) => input)
  .handler(async ({ data }) => {
    return createTaskForCurrentUser(data);
  });

const updateTaskServerFn = createServerFn({ method: "POST" })
  .validator((input: { taskId: string; fields: EditableTaskFields }) => input)
  .handler(async ({ data }) => {
    return updateTaskForCurrentUser(data.taskId, data.fields);
  });

const changeTaskStateServerFn = createServerFn({ method: "POST" })
  .validator((input: { taskId: string; taskState: TaskState }) => input)
  .handler(async ({ data }) => {
    return changeTaskStateForCurrentUser(data.taskId, data.taskState);
  });

const deleteTaskServerFn = createServerFn({ method: "POST" })
  .validator((input: { taskId: string }) => input)
  .handler(async ({ data }) => {
    await deleteTaskForCurrentUser(data.taskId);
  });

export function listTasks(): Promise<Task[]> {
  return listTasksServerFn();
}

export function createTask(input: {
  title: string;
  note?: string | null;
  dueDate?: string | null;
}): Promise<Task> {
  return createTaskServerFn({ data: input });
}

export function updateTask(taskId: string, fields: EditableTaskFields): Promise<Task> {
  return updateTaskServerFn({ data: { taskId, fields } });
}

export function changeTaskState(taskId: string, taskState: TaskState): Promise<Task> {
  return changeTaskStateServerFn({ data: { taskId, taskState } });
}

export function deleteTask(taskId: string): Promise<void> {
  return deleteTaskServerFn({ data: { taskId } });
}
