type TaskAction = "create" | "save" | "complete" | "archive" | "restore" | "delete";

const outcomes: Record<TaskAction, string> = {
  create: "created",
  save: "saved",
  complete: "completed",
  archive: "archived",
  restore: "restored",
  delete: "deleted",
};

export function taskActionError(error: unknown, action: TaskAction): string {
  if (error instanceof Error) {
    if (
      error.name === "AuthenticationRequiredError" ||
      error.message === "Sign in to access Tasks."
    ) {
      return `Sign in again before you ${action} the task. Your changes are still here.`;
    }
    if (error.message === "Title is required.") {
      return "Title is required. Enter a title and try again.";
    }
  }

  return `Could not confirm whether the task was ${outcomes[action]}. Check your connection, then refresh Tasks before trying again.`;
}
