import { createLibSqlTaskRepository } from "./taskRepository";
import type { EditableTaskFields, TaskFilter, TaskSort, TaskState, User } from "../domain/task";

const currentUser: User = { id: "local-user" };
const taskRepository = createLibSqlTaskRepository();

export async function createTaskForCurrentUser(input: {
  title: string;
  note?: string | null;
  dueDate?: string | null;
}) {
  await taskRepository.initialize();
  return taskRepository.createForUser(currentUser, input);
}

export async function updateTaskForCurrentUser(taskId: string, fields: EditableTaskFields) {
  await taskRepository.initialize();
  return taskRepository.updateForUser(currentUser, taskId, fields);
}

export async function changeTaskStateForCurrentUser(taskId: string, taskState: TaskState) {
  await taskRepository.initialize();
  return taskRepository.changeStateForUser(currentUser, taskId, taskState);
}

export async function deleteTaskForCurrentUser(taskId: string) {
  await taskRepository.initialize();
  await taskRepository.deleteForUser(currentUser, taskId);
}

export async function listMainViewTasksForCurrentUser(input: {
  filter: TaskFilter;
  sort: TaskSort;
  today: string;
}) {
  await taskRepository.initialize();
  return taskRepository.listMainViewForUser(currentUser, input);
}

export async function listArchivedTasksForCurrentUser(input: { sort: TaskSort }) {
  await taskRepository.initialize();
  return taskRepository.listArchivedForUser(currentUser, input.sort);
}
