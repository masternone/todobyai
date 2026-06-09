import { createTask, type Task } from "../domain/task";

const now = new Date();
const today = now.toISOString().slice(0, 10);

export const initialTasks: Task[] = [
  createTask({
    id: "task-seed-1",
    ownerUserId: "local-user",
    title: "Shape the first Task list",
    note: "Keep Active work prominent and let Completed work stay available when needed.",
    dueDate: today,
    now: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
  }),
  {
    ...createTask({
      id: "task-seed-2",
      ownerUserId: "local-user",
      title: "Confirm delete copy",
      note: "Delete should feel final and distinct from Archive.",
      dueDate: new Date(now.getTime() - 86400000).toISOString().slice(0, 10),
      now: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
    }),
    taskState: "Completed",
    modifiedDate: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
  },
];
