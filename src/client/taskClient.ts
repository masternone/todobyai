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
  changeTaskStateForCurrentUser,
  createTaskForCurrentUser,
  deleteTaskForCurrentUser,
  listArchivedTasksForCurrentUser,
  listMainViewTasksForCurrentUser,
  updateTaskForCurrentUser,
} from "../server/taskFunctions";

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
