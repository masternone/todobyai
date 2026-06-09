import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Archive, Check, Edit3, Inbox, RotateCcw, Save, Trash2, X } from "lucide-react";
import { Link, Outlet, RouterProvider, createRoute, createRootRoute, createRouter, useLocation, useRouter } from "@tanstack/react-router";
import {
  changeTaskState,
  createTask,
  deriveArchivedViewTasks,
  deriveMainViewTasks,
  editTask,
  isDueToday,
  isPastDue,
  type Task,
  type TaskFilter,
  type TaskSort,
  type TaskState,
} from "./domain/task";
import { initialTasks } from "./client/taskClient";
import "./styles.css";

const filters: TaskFilter[] = ["All", "Past Due", "Due Today"];
const sorts: TaskSort[] = ["Newest", "Oldest", "Recently Modified", "By Due Date"];
const buttonShape =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-3 transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-50";
const inactiveButton = "border-slate-300 bg-white text-slate-900 hover:bg-slate-100";
const activeButton = "border-teal-600 bg-teal-600 text-white hover:bg-teal-700";
const iconButton = `${buttonShape} ${inactiveButton} h-10 min-h-10 w-10 p-0`;
const taskCheckButton =
  "inline-flex h-10 min-h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600";
const fieldClass =
  "min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-900 focus:outline-2 focus:outline-offset-2 focus:outline-teal-600";

type AppContext = {
  tasks: Task[];
  addTask: (input: { title: string; note: string; dueDate: string }) => void;
  updateTask: (taskId: string, fields: { title: string; note: string; dueDate: string }) => void;
  moveTask: (taskId: string, taskState: TaskState) => void;
  deleteTask: (taskId: string) => void;
  today: string;
};

const AppStateContext = React.createContext<AppContext | null>(null);

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function buttonClass(active = false): string {
  return cx(buttonShape, active ? activeButton : inactiveButton);
}

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: NotFoundRedirect,
});

const mainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MainViewRoute,
});

const archiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/archive",
  component: ArchiveViewRoute,
});

const routeTree = rootRoute.addChildren([mainRoute, archiveRoute]);

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundRedirect,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppShell() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const today = new Date().toISOString().slice(0, 10);

  function addTask(input: { title: string; note: string; dueDate: string }) {
    setTasks((current) => [
      createTask({
        id: crypto.randomUUID(),
        ownerUserId: "local-user",
        title: input.title,
        note: input.note,
        dueDate: input.dueDate,
        now: new Date().toISOString(),
      }),
      ...current,
    ]);
  }

  function updateTask(taskId: string, fields: { title: string; note: string; dueDate: string }) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? editTask(task, { title: fields.title, note: fields.note, dueDate: fields.dueDate }, new Date().toISOString())
          : task,
      ),
    );
  }

  function moveTask(taskId: string, taskState: TaskState) {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? changeTaskState(task, taskState, new Date().toISOString()) : task)),
    );
  }

  function deleteTask(taskId: string) {
    const confirmed = window.confirm("Delete this Task permanently? This cannot be undone.");
    if (confirmed) {
      setTasks((current) => current.filter((task) => task.id !== taskId));
    }
  }

  const context: AppContext = {
    tasks,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    today,
  };

  return (
    <AppStateContext.Provider value={context}>
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        <Outlet />
      </main>
    </AppStateContext.Provider>
  );
}

function useAppState(): AppContext {
  const context = React.useContext(AppStateContext);
  if (!context) {
    throw new Error("App state is only available inside AppShell.");
  }
  return context;
}

function AppHeader({ title }: { title: string }) {
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-1 text-xs font-bold text-slate-500">Todo by AI</p>
        <h1 className="text-3xl font-bold leading-tight tracking-normal text-slate-950">{title}</h1>
      </div>
      <nav className="flex flex-wrap items-center gap-2" aria-label="Task views">
        <Link className={buttonClass(pathname === "/")} to="/">
          <Inbox size={16} />
          Main
        </Link>
        <Link className={buttonClass(pathname === "/archive")} to="/archive">
          <Archive size={16} />
          Archived
        </Link>
      </nav>
    </header>
  );
}

function MainViewRoute() {
  const { tasks, addTask, updateTask, moveTask, deleteTask, today } = useAppState();
  const [filter, setFilter] = useState<TaskFilter>("All");
  const [sort, setSort] = useState<TaskSort>("Newest");
  const [showCompleted, setShowCompleted] = useState(true);

  const mainView = useMemo(() => deriveMainViewTasks(tasks, { filter, sort, today }), [filter, sort, tasks, today]);

  return (
    <>
      <AppHeader title="Main View" />
      <TaskComposer onAdd={addTask} />
      <section className="my-4 mb-7 flex flex-col gap-2 md:flex-row md:items-end md:justify-between" aria-label="Main View controls">
        <SegmentedControl label="Task Filter" values={filters} value={filter} onChange={setFilter} />
        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-slate-500">Task Sort</span>
          <select className={fieldClass} value={sort} onChange={(event) => setSort(event.target.value as TaskSort)}>
            {sorts.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="inline-flex min-h-10 items-center gap-2 font-semibold text-slate-500">
          <input
            checked={showCompleted}
            className="w-auto accent-teal-600"
            onChange={(event) => setShowCompleted(event.target.checked)}
            type="checkbox"
          />
          <span>Completed Section</span>
        </label>
      </section>

      <TaskList
        title="Active"
        tasks={mainView.activeTasks}
        today={today}
        emptyText="No Active Tasks match this filter."
        onDelete={deleteTask}
        onMove={moveTask}
        onUpdate={updateTask}
      />
      {showCompleted ? (
        <TaskList
          title="Completed"
          tasks={mainView.completedTasks}
          today={today}
          emptyText="No Completed Tasks match this filter."
          onDelete={deleteTask}
          onMove={moveTask}
          onUpdate={updateTask}
        />
      ) : null}
    </>
  );
}

function ArchiveViewRoute() {
  const { tasks, updateTask, moveTask, deleteTask, today } = useAppState();
  const archivedTasks = useMemo(() => deriveArchivedViewTasks(tasks), [tasks]);

  return (
    <>
      <AppHeader title="Archived View" />
      <TaskList
        title="Archived"
        tasks={archivedTasks}
        today={today}
        emptyText="No Archived Tasks yet."
        onDelete={deleteTask}
        onMove={moveTask}
        onUpdate={updateTask}
      />
    </>
  );
}

function NotFoundRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    void router.navigate({ to: "/", replace: true });
  }, [router]);

  return null;
}

function TaskComposer({ onAdd }: { onAdd: (input: { title: string; note: string; dueDate: string }) => void }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, note, dueDate });
    setTitle("");
    setNote("");
    setDueDate("");
  }

  return (
    <form className="grid items-center gap-2 rounded-lg border border-slate-300 bg-white p-3 lg:grid-cols-4" onSubmit={submit}>
      <input
        aria-label="Title"
        className={fieldClass}
        placeholder="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <input
        aria-label="Note"
        className={fieldClass}
        placeholder="Note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <input
        aria-label="Due Date"
        className={fieldClass}
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
      />
      <button className={buttonClass(true)} disabled={!title.trim()} type="submit">
        <Save size={16} />
        Create
      </button>
    </form>
  );
}

function SegmentedControl<T extends string>({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div aria-label={label} className="grid gap-1.5" role="group">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {values.map((item) => (
          <button className={buttonClass(item === value)} key={item} onClick={() => onChange(item)} type="button">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskList(props: {
  title: string;
  tasks: Task[];
  today: string;
  emptyText: string;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string, state: TaskState) => void;
  onUpdate: (taskId: string, input: { title: string; note: string; dueDate: string }) => void;
}) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
        <h2 className="text-lg font-bold text-slate-950">{props.title}</h2>
        <span className="text-slate-500 tabular-nums">{props.tasks.length}</span>
      </div>
      {props.tasks.length ? (
        <div className="mt-3 grid gap-2">
          {props.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              today={props.today}
              onDelete={props.onDelete}
              onMove={props.onMove}
              onUpdate={props.onUpdate}
            />
          ))}
        </div>
      ) : (
        <p className="py-4 text-slate-500">{props.emptyText}</p>
      )}
    </section>
  );
}

function TaskRow({
  task,
  today,
  onDelete,
  onMove,
  onUpdate,
}: {
  task: Task;
  today: string;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string, state: TaskState) => void;
  onUpdate: (taskId: string, input: { title: string; note: string; dueDate: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [note, setNote] = useState(task.note ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const pastDue = isPastDue(task, today);
  const dueToday = isDueToday(task, today);

  function save() {
    onUpdate(task.id, { title, note, dueDate });
    setEditing(false);
  }

  return (
    <article
      className={cx(
        "flex flex-wrap items-start gap-3 rounded-lg border border-slate-300 bg-white p-3 md:flex-nowrap",
        pastDue && "bg-rose-50",
      )}
    >
      <button
        className={cx(
          taskCheckButton,
          task.taskState === "Active"
            ? "border-slate-300 bg-white text-slate-400 hover:border-teal-500 hover:bg-teal-50"
            : "border-teal-600 bg-teal-600 text-white hover:bg-teal-700",
        )}
        onClick={() => onMove(task.id, task.taskState === "Active" ? "Completed" : "Active")}
        title={task.taskState === "Active" ? "Complete Task" : "Restore Task"}
      >
        {task.taskState === "Active" ? null : <Check size={22} strokeWidth={2.5} />}
      </button>
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="grid gap-2 lg:grid-cols-3">
            <input className={fieldClass} aria-label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <input className={fieldClass} aria-label="Note" value={note} onChange={(event) => setNote(event.target.value)} />
            <input
              className={fieldClass}
              aria-label="Due Date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">{task.title}</h3>
              {pastDue ? (
                <span className="rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">Past Due</span>
              ) : null}
              {dueToday ? (
                <span className="rounded-full border border-teal-300 bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">Due Today</span>
              ) : null}
            </div>
            {task.note ? <p className="mt-1 max-w-prose leading-snug text-slate-500">{task.note}</p> : null}
            {task.dueDate ? (
              <dl className="mt-2 flex flex-wrap gap-4">
                <div>
                  <dt className="text-xs font-bold text-slate-500">Due Date</dt>
                  <dd className="mt-0.5">{task.dueDate}</dd>
                </div>
              </dl>
            ) : null}
          </>
        )}
      </div>
      <div className="ml-11 flex gap-1.5 md:ml-0">
        {editing ? (
          <>
            <button className={iconButton} onClick={save} title="Save Task">
              <Save size={16} />
            </button>
            <button className={iconButton} onClick={() => setEditing(false)} title="Cancel Edit">
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button className={iconButton} onClick={() => setEditing(true)} title="Edit Task">
              <Edit3 size={16} />
            </button>
            {task.taskState === "Archived" ? (
              <button className={iconButton} onClick={() => onMove(task.id, "Active")} title="Restore Task">
                <RotateCcw size={16} />
              </button>
            ) : (
              <button className={iconButton} onClick={() => onMove(task.id, "Archived")} title="Archive Task">
                <Archive size={16} />
              </button>
            )}
            <button className={iconButton} onClick={() => onDelete(task.id)} title="Delete Task">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
