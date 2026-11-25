import { createLibSqlTaskRepository } from "./taskRepository";
import type { TaskFilter, TaskSort } from "../domain/task";
import { getCurrentUserFromSession, type CurrentUserProvider } from "./currentUser";
import type { TaskRepository } from "./taskRepository";
import type { TaskViewSnapshot } from "../taskAppState";

export function createTaskFunctionHandlers(options?: {
  getCurrentUser?: CurrentUserProvider;
  taskRepository?: TaskRepository;
}) {
  const getCurrentUser = options?.getCurrentUser ?? getCurrentUserFromSession;
  const taskRepository = options?.taskRepository ?? createLibSqlTaskRepository();

  return {
    async loadTaskViewForCurrentUser(view: "Tasks" | "Archive"): Promise<TaskViewSnapshot> {
      const currentUser = await getCurrentUser();
      await taskRepository.initialize();
      return {
        ownerUserId: currentUser.id,
        mainView:
          view === "Tasks"
            ? await taskRepository.listMainViewForUser(currentUser, {
                filter: "All",
                sort: "Newest",
                today: "",
              })
            : { activeTasks: [], completedTasks: [] },
        archivedTasks:
          view === "Archive"
            ? await taskRepository.listArchivedForUser(currentUser, "Recently Modified")
            : [],
      };
    },
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

export const {
  loadTaskViewForCurrentUser,
  listArchivedTasksForCurrentUser,
  listMainViewTasksForCurrentUser,
} = defaultHandlers;
