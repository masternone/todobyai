import { describe, expect, it } from "vitest";
import type { Task, User } from "../domain/task";
import { createLibSqlTaskRepository } from "./taskRepository";

const ada: User = { id: "user_ada" };
const grace: User = { id: "user_grace" };

function createTestRepository() {
  let tick = 0;
  return createLibSqlTaskRepository({
    url: "file::memory:",
    now: () => new Date(`2026-06-11T12:${String(tick++).padStart(2, "0")}:00.000Z`),
  });
}

function titles(tasks: Task[]): string[] {
  return tasks.map((task) => task.title);
}

describe("LibSQL Task repository owner isolation", () => {
  it("lists only the owning User's Active, Completed, and Archived Tasks", async () => {
    const repository = createTestRepository();
    await repository.initialize();

    await repository.createForUser(ada, { title: "Ada active" });
    const adaCompleted = await repository.createForUser(ada, { title: "Ada completed" });
    await repository.changeStateForUser(ada, adaCompleted.id, "Completed");
    const adaArchived = await repository.createForUser(ada, { title: "Ada archived" });
    await repository.changeStateForUser(ada, adaArchived.id, "Archived");

    await repository.createForUser(grace, { title: "Grace active" });
    const graceCompleted = await repository.createForUser(grace, { title: "Grace completed" });
    await repository.changeStateForUser(grace, graceCompleted.id, "Completed");
    const graceArchived = await repository.createForUser(grace, { title: "Grace archived" });
    await repository.changeStateForUser(grace, graceArchived.id, "Archived");

    const mainView = await repository.listMainViewForUser(ada, {
      filter: "All",
      sort: "Newest",
      today: "2026-06-11",
    });
    const archive = await repository.listArchivedForUser(ada, "Recently Modified");

    expect(titles(mainView.activeTasks)).toEqual(["Ada active"]);
    expect(titles(mainView.completedTasks)).toEqual(["Ada completed"]);
    expect(titles(archive)).toEqual(["Ada archived"]);
  });

  it("applies Task Filters and Task Sorts only within the signed-in User's Tasks", async () => {
    const repository = createTestRepository();
    await repository.initialize();

    await repository.createForUser(ada, {
      title: "Ada no due date",
      dueDate: null,
    });
    await repository.createForUser(ada, {
      title: "Ada due later",
      dueDate: "2026-06-13",
    });
    await repository.createForUser(ada, {
      title: "Ada due today",
      dueDate: "2026-06-11",
    });
    await repository.createForUser(ada, {
      title: "Ada past due",
      dueDate: "2026-06-10",
    });
    await repository.createForUser(grace, {
      title: "Grace earlier past due",
      dueDate: "2026-06-09",
    });
    await repository.createForUser(grace, {
      title: "Grace due today",
      dueDate: "2026-06-11",
    });

    const sorted = await repository.listMainViewForUser(ada, {
      filter: "All",
      sort: "By Due Date",
      today: "2026-06-11",
    });
    const dueToday = await repository.listMainViewForUser(ada, {
      filter: "Due Today",
      sort: "Newest",
      today: "2026-06-11",
    });
    const pastDue = await repository.listMainViewForUser(ada, {
      filter: "Past Due",
      sort: "Newest",
      today: "2026-06-11",
    });

    expect(titles(sorted.activeTasks)).toEqual([
      "Ada past due",
      "Ada due today",
      "Ada due later",
      "Ada no due date",
    ]);
    expect(titles(dueToday.activeTasks)).toEqual(["Ada due today"]);
    expect(titles(pastDue.activeTasks)).toEqual(["Ada past due"]);
  });

  it("does not let one User mutate another User's Tasks by ID", async () => {
    const repository = createTestRepository();
    await repository.initialize();

    const task = await repository.createForUser(ada, { title: "Ada private task" });
    const archivedTask = await repository.createForUser(ada, { title: "Ada private archive" });
    await repository.changeStateForUser(ada, archivedTask.id, "Archived");

    await expect(
      repository.updateForUser(grace, task.id, { title: "Grace edit attempt" }),
    ).rejects.toThrow("Task not found.");
    await expect(repository.changeStateForUser(grace, task.id, "Completed")).rejects.toThrow(
      "Task not found.",
    );
    await expect(repository.changeStateForUser(grace, task.id, "Archived")).rejects.toThrow(
      "Task not found.",
    );
    await expect(repository.changeStateForUser(grace, archivedTask.id, "Active")).rejects.toThrow(
      "Task not found.",
    );
    await expect(repository.deleteForUser(grace, task.id)).resolves.toBeUndefined();

    const mainView = await repository.listMainViewForUser(ada, {
      filter: "All",
      sort: "Newest",
      today: "2026-06-11",
    });
    const archive = await repository.listArchivedForUser(ada, "Recently Modified");

    expect(mainView.activeTasks).toMatchObject([
      { id: task.id, title: "Ada private task", taskState: "Active" },
    ]);
    expect(archive).toMatchObject([
      { id: archivedTask.id, title: "Ada private archive", taskState: "Archived" },
    ]);
  });
});
