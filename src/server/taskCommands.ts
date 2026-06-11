import { type EditableTaskFields, type Task, type TaskState, type User } from "../domain/task";
import { createLibSqlTaskRepository } from "./taskRepository";

export type TaskCommand =
  | {
      type: "Create Task";
      input: { title: string; note?: string | null; dueDate?: string | null };
    }
  | { type: "Update Task"; taskId: string; fields: EditableTaskFields }
  | { type: "Change Task State"; taskId: string; taskState: TaskState }
  | { type: "Delete Task"; taskId: string };

const currentUser: User = { id: "local-user" };
const taskRepository = createLibSqlTaskRepository();

export async function runTaskCommandForCurrentUser(command: TaskCommand): Promise<Task | null> {
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
}
