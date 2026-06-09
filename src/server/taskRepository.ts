import { createClient, type Client } from "@libsql/client";
import {
  changeTaskState,
  createTask,
  deriveArchivedViewTasks,
  deriveMainViewTasks,
  editTask,
  type EditableTaskFields,
  type MainViewTasks,
  type Task,
  type TaskFilter,
  type TaskSort,
  type TaskState,
  type User,
} from "../domain/task";

export type TaskRepository = {
  initialize(): Promise<void>;
  createForUser(
    user: User,
    input: { title: string; note?: string | null; dueDate?: string | null },
  ): Promise<Task>;
  updateForUser(user: User, taskId: string, fields: EditableTaskFields): Promise<Task>;
  changeStateForUser(user: User, taskId: string, taskState: TaskState): Promise<Task>;
  deleteForUser(user: User, taskId: string): Promise<void>;
  listMainViewForUser(
    user: User,
    input: { filter: TaskFilter; sort: TaskSort; today: string },
  ): Promise<MainViewTasks>;
  listArchivedForUser(user: User): Promise<Task[]>;
};

export function createLibSqlTaskRepository(options?: {
  url?: string;
  now?: () => Date;
}): TaskRepository {
  const client = createClient({ url: options?.url ?? "file:todo-by-ai.db" });
  const now = () => (options?.now ?? (() => new Date()))().toISOString();

  return new LibSqlTaskRepository(client, now);
}

class LibSqlTaskRepository implements TaskRepository {
  constructor(
    private readonly client: Client,
    private readonly now: () => string,
  ) {}

  async initialize(): Promise<void> {
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        owner_user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        note TEXT,
        due_date TEXT,
        created_date TEXT NOT NULL,
        modified_date TEXT NOT NULL,
        task_state TEXT NOT NULL CHECK (task_state IN ('Active', 'Completed', 'Archived'))
      )
    `);
  }

  async createForUser(
    user: User,
    input: { title: string; note?: string | null; dueDate?: string | null },
  ): Promise<Task> {
    const task = createTask({
      id: crypto.randomUUID(),
      ownerUserId: user.id,
      title: input.title,
      note: input.note,
      dueDate: input.dueDate,
      now: this.now(),
    });
    await this.insert(task);
    return task;
  }

  async updateForUser(user: User, taskId: string, fields: EditableTaskFields): Promise<Task> {
    const existing = await this.getOwnedTask(user, taskId);
    const task = editTask(existing, fields, this.now());
    await this.replace(task);
    return task;
  }

  async changeStateForUser(user: User, taskId: string, taskState: TaskState): Promise<Task> {
    const existing = await this.getOwnedTask(user, taskId);
    const task = changeTaskState(existing, taskState, this.now());
    await this.replace(task);
    return task;
  }

  async deleteForUser(user: User, taskId: string): Promise<void> {
    await this.client.execute({
      sql: "DELETE FROM tasks WHERE id = ? AND owner_user_id = ?",
      args: [taskId, user.id],
    });
  }

  async listMainViewForUser(
    user: User,
    input: { filter: TaskFilter; sort: TaskSort; today: string },
  ): Promise<MainViewTasks> {
    const rows = await this.listOwnedTasks(user, "task_state != 'Archived'");
    return deriveMainViewTasks(rows, input);
  }

  async listArchivedForUser(user: User): Promise<Task[]> {
    return deriveArchivedViewTasks(await this.listOwnedTasks(user, "task_state = 'Archived'"));
  }

  private async getOwnedTask(user: User, taskId: string): Promise<Task> {
    const result = await this.client.execute({
      sql: "SELECT * FROM tasks WHERE id = ? AND owner_user_id = ?",
      args: [taskId, user.id],
    });
    const task = result.rows[0] ? rowToTask(result.rows[0]) : null;
    if (!task) {
      throw new Error("Task not found.");
    }
    return task;
  }

  private async listOwnedTasks(user: User, condition: string): Promise<Task[]> {
    const result = await this.client.execute({
      sql: `SELECT * FROM tasks WHERE owner_user_id = ? AND ${condition}`,
      args: [user.id],
    });
    return result.rows.map(rowToTask);
  }

  private async insert(task: Task): Promise<void> {
    await this.client.execute({
      sql: `
        INSERT INTO tasks (id, owner_user_id, title, note, due_date, created_date, modified_date, task_state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: taskToArgs(task),
    });
  }

  private async replace(task: Task): Promise<void> {
    await this.client.execute({
      sql: `
        UPDATE tasks
        SET title = ?, note = ?, due_date = ?, modified_date = ?, task_state = ?
        WHERE id = ? AND owner_user_id = ?
      `,
      args: [
        task.title,
        task.note,
        task.dueDate,
        task.modifiedDate,
        task.taskState,
        task.id,
        task.ownerUserId,
      ],
    });
  }
}

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id),
    title: String(row.title),
    note: row.note ? String(row.note) : null,
    dueDate: row.due_date ? String(row.due_date) : null,
    createdDate: String(row.created_date),
    modifiedDate: String(row.modified_date),
    taskState: row.task_state as TaskState,
  };
}

function taskToArgs(task: Task): string[] {
  return [
    task.id,
    task.ownerUserId,
    task.title,
    task.note ?? "",
    task.dueDate ?? "",
    task.createdDate,
    task.modifiedDate,
    task.taskState,
  ];
}
