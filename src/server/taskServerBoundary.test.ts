import { describe, expect, it } from "vitest";
import { AuthenticationRequiredError } from "./currentUser";
import { createTaskCommandHandlers } from "./taskCommands";
import { createTaskFunctionHandlers } from "./taskFunctions";
import type { MainViewTasks, Task, User } from "../domain/task";
import type { TaskRepository } from "./taskRepository";

function createRecordingRepository(): TaskRepository & { initialized: boolean; users: User[] } {
  return {
    initialized: false,
    users: [],
    async initialize() {
      this.initialized = true;
    },
    async createForUser(user, input) {
      this.users.push(user);
      return {
        id: "task-1",
        ownerUserId: user.id,
        title: input.title,
        note: input.note ?? null,
        dueDate: input.dueDate ?? null,
        createdDate: "2026-06-11T12:00:00.000Z",
        modifiedDate: "2026-06-11T12:00:00.000Z",
        taskState: "Active",
      };
    },
    async updateForUser(user) {
      this.users.push(user);
      throw new Error("Not used in this test.");
    },
    async changeStateForUser(user) {
      this.users.push(user);
      throw new Error("Not used in this test.");
    },
    async deleteForUser(user) {
      this.users.push(user);
    },
    async listMainViewForUser(user): Promise<MainViewTasks> {
      this.users.push(user);
      return { activeTasks: [], completedTasks: [] };
    },
    async listArchivedForUser(user): Promise<Task[]> {
      this.users.push(user);
      return [];
    },
  };
}

describe("Task server auth boundary", () => {
  it("rejects signed-out Task list requests", async () => {
    const taskRepository = createRecordingRepository();
    const handlers = createTaskFunctionHandlers({
      getCurrentUser: async () => {
        throw new AuthenticationRequiredError();
      },
      taskRepository,
    });

    await expect(
      handlers.listMainViewTasksForCurrentUser({
        filter: "All",
        sort: "Newest",
        today: "2026-06-11",
      }),
    ).rejects.toThrow("Sign in to access Tasks.");
    expect(taskRepository.initialized).toBe(false);
    expect(taskRepository.users).toEqual([]);
  });

  it("rejects signed-out Task command requests", async () => {
    const taskRepository = createRecordingRepository();
    const handlers = createTaskCommandHandlers({
      getCurrentUser: async () => {
        throw new AuthenticationRequiredError();
      },
      taskRepository,
    });

    await expect(
      handlers.runTaskCommandForCurrentUser({
        type: "Create Task",
        input: { title: "Draft launch plan" },
      }),
    ).rejects.toThrow("Sign in to access Tasks.");
    expect(taskRepository.initialized).toBe(false);
    expect(taskRepository.users).toEqual([]);
  });

  it("uses the authenticated Clerk User for Task list requests", async () => {
    const taskRepository = createRecordingRepository();
    const handlers = createTaskFunctionHandlers({
      getCurrentUser: async () => ({ id: "user_clerk_123" }),
      taskRepository,
    });

    await expect(
      handlers.listMainViewTasksForCurrentUser({
        filter: "All",
        sort: "Newest",
        today: "2026-06-11",
      }),
    ).resolves.toEqual({ activeTasks: [], completedTasks: [] });
    expect(taskRepository.users).toEqual([{ id: "user_clerk_123" }]);
  });

  it("creates Tasks for the authenticated Clerk User", async () => {
    const taskRepository = createRecordingRepository();
    const handlers = createTaskCommandHandlers({
      getCurrentUser: async () => ({ id: "user_clerk_456" }),
      taskRepository,
    });

    const task = await handlers.runTaskCommandForCurrentUser({
      type: "Create Task",
      input: { title: "Draft launch plan" },
    });

    expect(task?.ownerUserId).toBe("user_clerk_456");
    expect(taskRepository.users).toEqual([{ id: "user_clerk_456" }]);
  });
});
