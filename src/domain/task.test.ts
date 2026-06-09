import { describe, expect, it } from "vitest";
import {
  changeTaskState,
  createTask,
  deriveArchivedViewTasks,
  deriveMainViewTasks,
  editTask,
  isDueToday,
  isPastDue,
  type Task,
} from "./task";

const baseTask: Task = createTask({
  id: "task-1",
  ownerUserId: "user-1",
  title: "Write brief",
  now: "2026-06-09T12:00:00.000Z",
});

describe("Task domain behavior", () => {
  it("creates Active Tasks with automatic dates and immutable Created Date", () => {
    const edited = editTask(baseTask, { title: "Write sharper brief" }, "2026-06-09T13:00:00.000Z");

    expect(baseTask.taskState).toBe("Active");
    expect(baseTask.createdDate).toBe("2026-06-09T12:00:00.000Z");
    expect(edited.createdDate).toBe(baseTask.createdDate);
    expect(edited.modifiedDate).toBe("2026-06-09T13:00:00.000Z");
  });

  it("enforces allowed Task State transitions", () => {
    const completed = changeTaskState(baseTask, "Completed", "2026-06-09T13:00:00.000Z");
    const archived = changeTaskState(completed, "Archived", "2026-06-09T14:00:00.000Z");
    const restored = changeTaskState(archived, "Active", "2026-06-09T15:00:00.000Z");

    expect(restored.taskState).toBe("Active");
    expect(() => changeTaskState(archived, "Completed", "2026-06-09T15:00:00.000Z")).toThrow(
      "Cannot move Task from Archived to Completed.",
    );
  });

  it("classifies Past Due and Due Today as display conditions", () => {
    expect(isPastDue({ dueDate: "2026-06-08" }, "2026-06-09")).toBe(true);
    expect(isDueToday({ dueDate: "2026-06-09" }, "2026-06-09")).toBe(true);
    expect(baseTask.taskState).toBe("Active");
  });

  it("derives Main View Tasks according to Task Filter and Task Sort rules", () => {
    const tasks: Task[] = [
      { ...baseTask, id: "a", createdDate: "2026-06-08T12:00:00.000Z", dueDate: null },
      { ...baseTask, id: "b", createdDate: "2026-06-09T12:00:00.000Z", dueDate: "2026-06-11" },
      { ...baseTask, id: "c", createdDate: "2026-06-07T12:00:00.000Z", dueDate: "2026-06-10" },
      {
        ...baseTask,
        id: "d",
        taskState: "Completed",
        dueDate: "2026-06-10",
        modifiedDate: "2026-06-09T11:00:00.000Z",
      },
      {
        ...baseTask,
        id: "e",
        taskState: "Completed",
        dueDate: "2026-06-10",
        modifiedDate: "2026-06-09T10:00:00.000Z",
      },
      {
        ...baseTask,
        id: "f",
        taskState: "Archived",
        dueDate: "2026-06-10",
        modifiedDate: "2026-06-09T12:00:00.000Z",
      },
    ];

    expect(
      deriveMainViewTasks(tasks, {
        filter: "All",
        sort: "Newest",
        today: "2026-06-09",
      }).activeTasks.map((task) => task.id),
    ).toEqual(["b", "a", "c"]);
    expect(
      deriveMainViewTasks(tasks, {
        filter: "All",
        sort: "Oldest",
        today: "2026-06-09",
      }).activeTasks.map((task) => task.id),
    ).toEqual(["c", "a", "b"]);
    expect(
      deriveMainViewTasks(tasks, {
        filter: "All",
        sort: "By Due Date",
        today: "2026-06-09",
      }).activeTasks.map((task) => task.id),
    ).toEqual(["c", "b", "a"]);
    expect(
      deriveMainViewTasks(tasks, { filter: "Due Today", sort: "Newest", today: "2026-06-10" }),
    ).toEqual({
      activeTasks: [tasks[2]],
      completedTasks: [tasks[3], tasks[4]],
    });
  });

  it("derives Archived View Tasks according to Task Sort rules", () => {
    const tasks: Task[] = [
      { ...baseTask, id: "active", taskState: "Active", modifiedDate: "2026-06-09T12:00:00.000Z" },
      {
        ...baseTask,
        id: "old-archive",
        taskState: "Archived",
        createdDate: "2026-06-07T12:00:00.000Z",
        dueDate: "2026-06-11",
        modifiedDate: "2026-06-09T10:00:00.000Z",
      },
      {
        ...baseTask,
        id: "new-archive",
        taskState: "Archived",
        createdDate: "2026-06-08T12:00:00.000Z",
        dueDate: "2026-06-10",
        modifiedDate: "2026-06-09T11:00:00.000Z",
      },
    ];

    expect(deriveArchivedViewTasks(tasks).map((task) => task.id)).toEqual([
      "new-archive",
      "old-archive",
    ]);
    expect(deriveArchivedViewTasks(tasks, "Oldest").map((task) => task.id)).toEqual([
      "old-archive",
      "new-archive",
    ]);
    expect(deriveArchivedViewTasks(tasks, "By Due Date").map((task) => task.id)).toEqual([
      "new-archive",
      "old-archive",
    ]);
  });
});
