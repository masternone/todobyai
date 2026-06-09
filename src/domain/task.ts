export type TaskState = "Active" | "Completed" | "Archived";
export type TaskFilter = "All" | "Past Due" | "Due Today";
export type TaskSort = "Newest" | "Oldest" | "Recently Modified" | "By Due Date";

export type User = {
  id: string;
};

export type Task = {
  id: string;
  ownerUserId: string;
  title: string;
  note: string | null;
  dueDate: string | null;
  createdDate: string;
  modifiedDate: string;
  taskState: TaskState;
};

export type EditableTaskFields = {
  title?: string;
  note?: string | null;
  dueDate?: string | null;
};

export type MainViewTasks = {
  activeTasks: Task[];
  completedTasks: Task[];
};

const allowedTransitions: Record<TaskState, TaskState[]> = {
  Active: ["Completed", "Archived"],
  Completed: ["Active", "Archived"],
  Archived: ["Active"],
};

export function createTask(input: {
  id: string;
  ownerUserId: string;
  title: string;
  note?: string | null;
  dueDate?: string | null;
  now: string;
}): Task {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required.");
  }

  return {
    id: input.id,
    ownerUserId: input.ownerUserId,
    title,
    note: normalizeNote(input.note),
    dueDate: normalizeDueDate(input.dueDate),
    createdDate: input.now,
    modifiedDate: input.now,
    taskState: "Active",
  };
}

export function editTask(task: Task, fields: EditableTaskFields, now: string): Task {
  const nextTitle = fields.title === undefined ? task.title : fields.title.trim();
  if (!nextTitle) {
    throw new Error("Title is required.");
  }

  return {
    ...task,
    title: nextTitle,
    note: fields.note === undefined ? task.note : normalizeNote(fields.note),
    dueDate: fields.dueDate === undefined ? task.dueDate : normalizeDueDate(fields.dueDate),
    modifiedDate: now,
  };
}

export function changeTaskState(task: Task, nextState: TaskState, now: string): Task {
  if (task.taskState === nextState) {
    return task;
  }

  if (!allowedTransitions[task.taskState].includes(nextState)) {
    throw new Error(`Cannot move Task from ${task.taskState} to ${nextState}.`);
  }

  return {
    ...task,
    taskState: nextState,
    modifiedDate: now,
  };
}

export function isPastDue(task: Pick<Task, "dueDate">, today: string): boolean {
  return Boolean(task.dueDate && task.dueDate < today);
}

export function isDueToday(task: Pick<Task, "dueDate">, today: string): boolean {
  return task.dueDate === today;
}

export function matchesTaskFilter(task: Task, filter: TaskFilter, today: string): boolean {
  if (filter === "Past Due") return isPastDue(task, today);
  if (filter === "Due Today") return isDueToday(task, today);
  return true;
}

export function sortActiveTasks(tasks: Task[], sort: TaskSort): Task[] {
  const copy = [...tasks];
  return copy.sort((a, b) => {
    if (sort === "Oldest") return compareAsc(a.createdDate, b.createdDate);
    if (sort === "Recently Modified") return compareDesc(a.modifiedDate, b.modifiedDate);
    if (sort === "By Due Date") return compareByDueDate(a, b);
    return compareDesc(a.createdDate, b.createdDate);
  });
}

export function sortCompletedTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => compareDesc(a.modifiedDate, b.modifiedDate));
}

export function deriveMainViewTasks(tasks: Task[], input: { filter: TaskFilter; sort: TaskSort; today: string }): MainViewTasks {
  const visible = tasks.filter((task) => task.taskState !== "Archived").filter((task) => matchesTaskFilter(task, input.filter, input.today));
  return {
    activeTasks: sortActiveTasks(
      visible.filter((task) => task.taskState === "Active"),
      input.sort,
    ),
    completedTasks: sortCompletedTasks(visible.filter((task) => task.taskState === "Completed")),
  };
}

export function deriveArchivedViewTasks(tasks: Task[]): Task[] {
  return sortCompletedTasks(tasks.filter((task) => task.taskState === "Archived"));
}

function compareAsc(a: string, b: string): number {
  return a.localeCompare(b);
}

function compareDesc(a: string, b: string): number {
  return b.localeCompare(a);
}

function compareByDueDate(a: Task, b: Task): number {
  if (a.dueDate && b.dueDate) return compareAsc(a.dueDate, b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return compareDesc(a.createdDate, b.createdDate);
}

function normalizeNote(note: string | null | undefined): string | null {
  const value = note?.trim();
  return value ? value : null;
}

function normalizeDueDate(dueDate: string | null | undefined): string | null {
  return dueDate || null;
}
