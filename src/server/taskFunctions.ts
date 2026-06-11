import { createLibSqlTaskRepository } from "./taskRepository";
import type { TaskFilter, TaskSort, User } from "../domain/task";

const currentUser: User = { id: "local-user" };
const taskRepository = createLibSqlTaskRepository();

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
