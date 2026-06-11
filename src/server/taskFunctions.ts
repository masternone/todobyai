import { createLibSqlTaskRepository } from "./taskRepository";
import type { TaskFilter, TaskSort } from "../domain/task";
import { getCurrentUserFromSession, type CurrentUserProvider } from "./currentUser";
import type { TaskRepository } from "./taskRepository";

export function createTaskFunctionHandlers(options?: {
  getCurrentUser?: CurrentUserProvider;
  taskRepository?: TaskRepository;
}) {
  const getCurrentUser = options?.getCurrentUser ?? getCurrentUserFromSession;
  const taskRepository = options?.taskRepository ?? createLibSqlTaskRepository();

  return {
    async listMainViewTasksForCurrentUser(input: {
      filter: TaskFilter;
      sort: TaskSort;
      today: string;
    }) {
      const currentUser = await getCurrentUser();
      await taskRepository.initialize();
      return taskRepository.listMainViewForUser(currentUser, input);
    },

    async listArchivedTasksForCurrentUser(input: { sort: TaskSort }) {
      const currentUser = await getCurrentUser();
      await taskRepository.initialize();
      return taskRepository.listArchivedForUser(currentUser, input.sort);
    },
  };
}

const defaultHandlers = createTaskFunctionHandlers();

export const { listArchivedTasksForCurrentUser, listMainViewTasksForCurrentUser } = defaultHandlers;
