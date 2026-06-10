import React, { useEffect, useMemo, useRef, useState } from "react";
import { Archive, Check, Edit3, Inbox, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  deriveArchivedViewTasks,
  deriveMainViewTasks,
  isDueToday,
  isPastDue,
  type Task,
  type TaskFilter,
  type TaskSort,
  type TaskState,
} from "./domain/task";
import * as taskClient from "./client/taskClient";
import "./styles.css";

const filters: TaskFilter[] = ["All", "Past Due", "Due Today"];
const sorts: TaskSort[] = ["Newest", "Oldest", "Recently Modified", "By Due Date"];
const buttonShape =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-semibold transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const inactiveButton = "border-rule bg-surface text-ink hover:bg-app-canvas";
const activeButton = "border-accent bg-accent text-surface hover:bg-accent-hover";
const iconButton = `${buttonShape} ${inactiveButton} h-11 min-h-11 w-11 p-0`;
const taskCheckButton =
  "inline-flex h-11 min-h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const fieldClass =
  "min-h-11 w-full rounded-md border border-rule bg-surface px-3 text-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent";

type AppContext = {
  tasks: Task[];
  isLoadingTasks: boolean;
  addTask: (input: { title: string; note: string; dueDate: string }) => Promise<void>;
  updateTask: (
    taskId: string,
    fields: { title: string; note: string; dueDate: string },
  ) => Promise<void>;
  moveTask: (taskId: string, taskState: TaskState) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  today: string;
};

const AppStateContext = React.createContext<AppContext | null>(null);

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function buttonClass(active = false): string {
  return cx(buttonShape, active ? activeButton : inactiveButton);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function taskSortSelectMarkup(value: TaskSort): { __html: string } {
  const optionMarkup = sorts.map((item) => `<option value="${item}">${item}</option>`).join("");
  const selectedValue = escapeHtml(value);
  return {
    __html: `<button type="button"><selectedcontent hidden></selectedcontent><span class="task-sort-select__value">${selectedValue}</span></button>${optionMarkup}`,
  };
}

export function TaskAppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "failed">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        const loadedTasks = await taskClient.listTasks();
        if (!cancelled) {
          setTasks(loadedTasks);
          setLoadState("loaded");
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadState("failed");
          setErrorMessage(error instanceof Error ? error.message : "Could not load Tasks.");
        }
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  async function addTask(input: { title: string; note: string; dueDate: string }) {
    const task = await taskClient.createTask(input);
    setTasks((current) => [task, ...current]);
  }

  async function updateTask(
    taskId: string,
    fields: { title: string; note: string; dueDate: string },
  ) {
    const updatedTask = await taskClient.updateTask(taskId, fields);
    setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
  }

  async function moveTask(taskId: string, taskState: TaskState) {
    const updatedTask = await taskClient.changeTaskState(taskId, taskState);
    setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
  }

  async function deleteTask(taskId: string) {
    const confirmed = window.confirm("Delete this Task permanently? This cannot be undone.");
    if (confirmed) {
      await taskClient.deleteTask(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    }
  }

  const context: AppContext = {
    tasks,
    isLoadingTasks: loadState === "loading",
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    today,
  };

  return (
    <AppStateContext.Provider value={context}>
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        {loadState === "failed" ? (
          <p className="py-8 text-danger">{errorMessage ?? "Could not load Tasks."}</p>
        ) : null}
        {loadState !== "failed" ? children : null}
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
        <p className="mb-1 text-xs font-bold text-ink-muted">Todo by AI</p>
        <h1 className="text-3xl font-bold leading-tight tracking-normal text-ink-strong">
          {title}
        </h1>
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

export function MainViewRoute() {
  const { tasks, isLoadingTasks, addTask, updateTask, moveTask, deleteTask, today } = useAppState();
  const [filter, setFilter] = useState<TaskFilter>("All");
  const [sort, setSort] = useState<TaskSort>("Newest");
  const [showCompleted, setShowCompleted] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDraft, setComposerDraft] = useState({ title: "", note: "", dueDate: "" });

  const mainView = useMemo(
    () => deriveMainViewTasks(tasks, { filter, sort, today }),
    [filter, sort, tasks, today],
  );

  return (
    <>
      <AppHeader title="Main View" />
      {composerOpen ? (
        <TaskComposerDialog
          draft={composerDraft}
          onAdd={addTask}
          onCancel={() => {
            setComposerDraft({ title: "", note: "", dueDate: "" });
            setComposerOpen(false);
          }}
          onChange={setComposerDraft}
          onClose={() => setComposerOpen(false)}
          onCreated={() => {
            setComposerDraft({ title: "", note: "", dueDate: "" });
            setComposerOpen(false);
          }}
        />
      ) : null}
      <section
        className="my-4 mb-7 flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
        aria-label="Main View controls"
      >
        <button
          className={buttonClass(true)}
          disabled={isLoadingTasks}
          onClick={() => setComposerOpen(true)}
          type="button"
        >
          <Plus size={16} />
          Add Task
        </button>
        <SegmentedControl
          label="Task Filter"
          values={filters}
          value={filter}
          onChange={setFilter}
        />
        <TaskSortSelect value={sort} onChange={setSort} />
        <label className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink-muted">
          <input
            checked={showCompleted}
            className="h-4 w-4 accent-accent"
            onChange={(event) => setShowCompleted(event.target.checked)}
            type="checkbox"
          />
          <span>Completed Section</span>
        </label>
      </section>

      <TaskList
        isLoading={isLoadingTasks}
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
          isLoading={isLoadingTasks}
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

export function ArchiveViewRoute() {
  const { tasks, isLoadingTasks, updateTask, moveTask, deleteTask, today } = useAppState();
  const [sort, setSort] = useState<TaskSort>("Recently Modified");
  const archivedTasks = useMemo(() => deriveArchivedViewTasks(tasks, sort), [sort, tasks]);

  return (
    <>
      <AppHeader title="Archived View" />
      <section
        className="my-4 mb-7 flex flex-col gap-2 md:flex-row md:items-end md:justify-end"
        aria-label="Archived View controls"
      >
        <TaskSortSelect value={sort} onChange={setSort} />
      </section>
      <TaskList
        isLoading={isLoadingTasks}
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

function TaskComposer({
  draft,
  onAdd,
  onCancel,
  onChange,
  onCreated,
}: {
  draft: { title: string; note: string; dueDate: string };
  onAdd: (input: { title: string; note: string; dueDate: string }) => Promise<void>;
  onCancel: () => void;
  onChange: (draft: { title: string; note: string; dueDate: string }) => void;
  onCreated?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [showTitleRequired, setShowTitleRequired] = useState(false);
  const titleErrorId = "task-composer-title-error";
  const titleMissing = !draft.title.trim();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (titleMissing || saving) {
      setShowTitleRequired(titleMissing);
      return;
    }
    setSaving(true);
    try {
      await onAdd(draft);
      onCreated?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <input
            aria-describedby={showTitleRequired ? titleErrorId : undefined}
            aria-invalid={showTitleRequired}
            aria-label="Title"
            className={fieldClass}
            placeholder="Task Title (required)"
            value={draft.title}
            onBlur={() => setShowTitleRequired(titleMissing)}
            onChange={(event) => {
              setShowTitleRequired(false);
              onChange({ ...draft, title: event.target.value });
            }}
          />
          <span
            className="min-h-5 text-sm font-semibold text-danger"
            id={titleErrorId}
            role={showTitleRequired ? "alert" : undefined}
          >
            {showTitleRequired ? "Title is required." : null}
          </span>
        </label>
        <label className="grid gap-1.5">
          <input
            aria-label="Due Date"
            className={fieldClass}
            type="date"
            value={draft.dueDate}
            onChange={(event) => onChange({ ...draft, dueDate: event.target.value })}
          />
          <span className="min-h-5" aria-hidden="true" />
        </label>
      </div>
      <textarea
        aria-label="Note"
        className={cx(fieldClass, "min-h-32 resize-y py-2")}
        placeholder="Add useful context, constraints, links, reminders, or the next small step for this Task."
        value={draft.note}
        onChange={(event) => onChange({ ...draft, note: event.target.value })}
      />
      <div className="flex flex-wrap justify-end gap-2">
        <button className={buttonClass(false)} onClick={onCancel} type="button">
          <X size={16} />
          Cancel
        </button>
        <button className={buttonClass(true)} disabled={saving} type="submit">
          <Save size={16} />
          Create
        </button>
      </div>
    </form>
  );
}

function TaskComposerDialog({
  draft,
  onAdd,
  onCancel,
  onChange,
  onClose,
  onCreated,
}: {
  draft: { title: string; note: string; dueDate: string };
  onAdd: (input: { title: string; note: string; dueDate: string }) => Promise<void>;
  onCancel: () => void;
  onChange: (draft: { title: string; note: string; dueDate: string }) => void;
  onClose: () => void;
  onCreated: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  return (
    <dialog
      aria-labelledby="task-composer-title"
      className="m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-4 backdrop:bg-ink-strong/40 open:grid open:place-items-center"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      ref={dialogRef}
    >
      <div className="w-full max-w-xl rounded-lg border border-rule bg-surface p-4 text-ink shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink-strong" id="task-composer-title">
            Add Task
          </h2>
          <button
            aria-label="Close Dialog"
            className={iconButton}
            onClick={onClose}
            title="Close Dialog"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        <TaskComposer
          draft={draft}
          onAdd={onAdd}
          onCancel={onCancel}
          onChange={onChange}
          onCreated={onCreated}
        />
      </div>
    </dialog>
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
      <span className="text-xs font-bold text-ink-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {values.map((item) => (
          <button
            className={buttonClass(item === value)}
            key={item}
            onClick={() => onChange(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskSortSelect({
  value,
  onChange,
}: {
  value: TaskSort;
  onChange: (value: TaskSort) => void;
}) {
  return (
    <label className="task-sort-select grid gap-1.5">
      <span className="text-xs font-bold text-ink-muted">Task Sort</span>
      <select
        className={cx(fieldClass, "task-sort-select__control task-sort-select__control--custom")}
        value={value}
        onChange={(event) => onChange(event.target.value as TaskSort)}
        dangerouslySetInnerHTML={taskSortSelectMarkup(value)}
        suppressHydrationWarning
      />
    </label>
  );
}

function TaskList(props: {
  isLoading: boolean;
  title: string;
  tasks: Task[];
  today: string;
  emptyText: string;
  onDelete: (taskId: string) => Promise<void>;
  onMove: (taskId: string, state: TaskState) => Promise<void>;
  onUpdate: (
    taskId: string,
    input: { title: string; note: string; dueDate: string },
  ) => Promise<void>;
}) {
  return (
    <section aria-busy={props.isLoading} className="mt-6">
      <div className="flex items-center justify-between border-b border-rule pb-2">
        <h2 className="text-lg font-bold text-ink-strong">{props.title}</h2>
        <span className="text-ink-muted tabular-nums">
          {props.isLoading ? "..." : props.tasks.length}
        </span>
      </div>
      {props.isLoading ? (
        <TaskListSkeleton />
      ) : props.tasks.length ? (
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
        <p className="py-4 text-ink-muted">{props.emptyText}</p>
      )}
    </section>
  );
}

function TaskListSkeleton() {
  return (
    <div className="mt-3 grid gap-2" aria-label="Loading Tasks">
      {[0, 1, 2].map((item) => (
        <article
          className="flex animate-pulse flex-wrap items-start gap-3 rounded-lg border border-rule bg-surface p-3 md:flex-nowrap"
          key={item}
        >
          <div className="h-11 w-11 shrink-0 rounded-md border border-rule-soft bg-app-canvas" />
          <div className="min-w-0 flex-1 pt-1">
            <div className="h-4 w-2/3 max-w-80 rounded bg-rule-soft" />
            <div className="mt-3 h-3 w-full max-w-xl rounded bg-app-canvas" />
            <div className="mt-2 h-3 w-36 rounded bg-app-canvas" />
          </div>
          <div className="ml-11 flex gap-1.5 md:ml-0">
            <div className="h-11 w-11 rounded-md border border-rule-soft bg-app-canvas" />
            <div className="h-11 w-11 rounded-md border border-rule-soft bg-app-canvas" />
            <div className="h-11 w-11 rounded-md border border-rule-soft bg-app-canvas" />
          </div>
        </article>
      ))}
    </div>
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
  onDelete: (taskId: string) => Promise<void>;
  onMove: (taskId: string, state: TaskState) => Promise<void>;
  onUpdate: (
    taskId: string,
    input: { title: string; note: string; dueDate: string },
  ) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [note, setNote] = useState(task.note ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const pastDue = isPastDue(task, today);
  const dueToday = isDueToday(task, today);

  async function save() {
    await onUpdate(task.id, { title, note, dueDate });
    setEditing(false);
  }

  return (
    <article
      className={cx(
        "flex flex-wrap items-start gap-3 rounded-lg border border-rule bg-surface p-3 md:flex-nowrap",
        pastDue && "bg-danger-soft",
      )}
    >
      <button
        className={cx(
          taskCheckButton,
          task.taskState === "Active"
            ? "border-rule bg-surface text-ink-muted hover:border-accent hover:bg-accent-soft"
            : "border-accent bg-accent text-surface hover:bg-accent-hover",
        )}
        aria-label={task.taskState === "Active" ? "Complete Task" : "Restore Task"}
        onClick={() => void onMove(task.id, task.taskState === "Active" ? "Completed" : "Active")}
        title={task.taskState === "Active" ? "Complete Task" : "Restore Task"}
      >
        {task.taskState === "Active" ? null : <Check size={22} strokeWidth={2.5} />}
      </button>
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="grid gap-2 lg:grid-cols-3">
            <input
              className={fieldClass}
              aria-label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <input
              className={fieldClass}
              aria-label="Note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
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
              <h3 className="break-words font-semibold text-ink-strong">{task.title}</h3>
              {pastDue ? (
                <span className="rounded-full border border-danger-rule bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger">
                  Past Due
                </span>
              ) : null}
              {dueToday ? (
                <span className="rounded-full border border-accent bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-hover">
                  Due Today
                </span>
              ) : null}
            </div>
            {task.note ? (
              <p className="mt-1 max-w-prose break-words leading-snug text-ink-muted">
                {task.note}
              </p>
            ) : null}
            {task.dueDate ? (
              <dl className="mt-2 flex flex-wrap gap-4">
                <div>
                  <dt className="text-xs font-bold text-ink-muted">Due Date</dt>
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
            <button
              aria-label="Save Task"
              className={iconButton}
              onClick={() => void save()}
              title="Save Task"
            >
              <Save size={16} />
            </button>
            <button
              aria-label="Cancel Edit"
              className={iconButton}
              onClick={() => setEditing(false)}
              title="Cancel Edit"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              aria-label="Edit Task"
              className={iconButton}
              onClick={() => setEditing(true)}
              title="Edit Task"
            >
              <Edit3 size={16} />
            </button>
            {task.taskState === "Archived" ? (
              <button
                aria-label="Restore Task"
                className={iconButton}
                onClick={() => void onMove(task.id, "Active")}
                title="Restore Task"
              >
                <RotateCcw size={16} />
              </button>
            ) : (
              <button
                aria-label="Archive Task"
                className={iconButton}
                onClick={() => void onMove(task.id, "Archived")}
                title="Archive Task"
              >
                <Archive size={16} />
              </button>
            )}
            <button
              aria-label="Delete Task"
              className={iconButton}
              onClick={() => void onDelete(task.id)}
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
