import { type EditableTaskFields, type Task, type TaskState } from "../domain/task";
import { getCurrentUserFromSession, type CurrentUserProvider } from "./currentUser";
import { createLibSqlTaskRepository, type TaskRepository } from "./taskRepository";

export type TaskCommand =
  | {
      type: "Create Task";
      input: { title: string; note?: string | null; dueDate?: string | null };
    }
  | { type: "Update Task"; taskId: string; fields: EditableTaskFields }
  | { type: "Change Task State"; taskId: string; taskState: TaskState }
  | { type: "Delete Task"; taskId: string };

export function createTaskCommandHandlers(options?: {
  getCurrentUser?: CurrentUserProvider;
  taskRepository?: TaskRepository;
}) {
  const getCurrentUser = options?.getCurrentUser ?? getCurrentUserFromSession;
  const taskRepository = options?.taskRepository ?? createLibSqlTaskRepository();

  return {
    async runTaskCommandForCurrentUser(command: TaskCommand): Promise<Task | null> {
      const currentUser = await getCurrentUser();
      await taskRepository.initialize();

      if (command.type === "Create Task") {
        return taskRepository.createForUser(currentUser, command.input);
      }

      if (command.type === "Update Task") {
        return taskRepository.updateForUser(currentUser, command.taskId, command.fields);
      }

      if (command.type === "Change Task State") {
        return taskRepository.changeStateForUser(currentUser, command.taskId, command.taskState);
      }

      await taskRepository.deleteForUser(currentUser, command.taskId);
      return null;
    },
  };
}

const defaultHandlers = createTaskCommandHandlers();

export const { runTaskCommandForCurrentUser } = defaultHandlers;
