import { useEffect, useRef, useState } from "react";
import { Archive, Check, Edit3, Inbox, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  type MainViewTasks,
  isDueToday,
  isPastDue,
  type Task,
  type TaskFilter,
  type TaskSort,
  type TaskState,
} from "./domain/task";
import { type TaskDraftFields, useTaskAppState } from "./taskAppState";

type TaskSurfaceView = "Tasks" | "Archive";
type TaskListSection = { title: string; tasks: Task[]; emptyText: string };

const emptyDraft: TaskDraftFields = { title: "", note: "", dueDate: "" };
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

export function TaskSurface({ view }: { view: TaskSurfaceView }) {
  const workflow = useTaskSurfaceWorkflow(view);

  return (
    <>
      <TaskSurfaceHeader title={view} />
      {workflow.composer.open ? (
        <TaskComposerDialog
          draft={workflow.composer.draft}
          onAdd={workflow.actions.addTask}
          onCancel={workflow.composer.cancel}
          onChange={workflow.composer.updateDraft}
          onClose={workflow.composer.requestClose}
          onCreated={workflow.composer.created}
        />
      ) : null}
      <TaskSurfaceControls workflow={workflow} />
      {workflow.queryErrorMessage ? (
        <p className="py-4 text-danger">{workflow.queryErrorMessage}</p>
      ) : null}
      {workflow.sections.map((section) => (
        <TaskList
          emptyText={section.emptyText}
          isLoading={workflow.isLoading}
          key={section.title}
          tasks={section.tasks}
          title={section.title}
          today={workflow.today}
          onDelete={workflow.actions.deleteTask}
          onMove={workflow.actions.moveTask}
          onUpdate={workflow.actions.updateTask}
        />
      ))}
    </>
  );
}

function useTaskSurfaceWorkflow(view: TaskSurfaceView) {
  const { addTask, deleteTask, listArchivedTasks, listMainViewTasks, moveTask, today, updateTask } =
    useTaskAppState();
  const [filter, setFilter] = useState<TaskFilter>("All");
  const [mainViewSort, setMainViewSort] = useState<TaskSort>("Newest");
  const [archivedViewSort, setArchivedViewSort] = useState<TaskSort>("Recently Modified");
  const [showCompleted, setShowCompleted] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDraft, setComposerDraft] = useState<TaskDraftFields>(emptyDraft);
  const [queryState, setQueryState] = useState<{
    archivedTasks: Task[];
    errorMessage: string | null;
    isLoading: boolean;
    mainView: MainViewTasks;
  }>({
    archivedTasks: [],
    errorMessage: null,
    isLoading: true,
    mainView: { activeTasks: [], completedTasks: [] },
  });

  async function loadCurrentTasks(options?: { cancelled?: () => boolean }) {
    setQueryState((current) => ({ ...current, errorMessage: null, isLoading: true }));
    try {
      const next =
        view === "Tasks"
          ? {
              mainView: await listMainViewTasks({ filter, sort: mainViewSort, today }),
              archivedTasks: [],
            }
          : {
              archivedTasks: await listArchivedTasks({ sort: archivedViewSort }),
              mainView: { activeTasks: [], completedTasks: [] },
            };

      if (!options?.cancelled?.()) {
        setQueryState({
          ...next,
          errorMessage: null,
          isLoading: false,
        });
      }
    } catch (error) {
      if (!options?.cancelled?.()) {
        setQueryState((current) => ({
          ...current,
          errorMessage: error instanceof Error ? error.message : "Could not load Tasks.",
          isLoading: false,
        }));
      }
    }
  }

  useEffect(() => {
    let cancelled = false;
    void loadCurrentTasks({ cancelled: () => cancelled });
    return () => {
      cancelled = true;
    };
  }, [archivedViewSort, filter, listArchivedTasks, listMainViewTasks, mainViewSort, today, view]);

  async function runCommand(command: () => Promise<void>) {
    await command();
    await loadCurrentTasks();
  }

  function resetComposer() {
    setComposerDraft(emptyDraft);
    setComposerOpen(false);
  }

  const sections: TaskListSection[] =
    view === "Tasks"
      ? [
          {
            title: "Active",
            tasks: queryState.mainView.activeTasks,
            emptyText: "No active tasks match this filter.",
          },
          ...(showCompleted
            ? [
                {
                  title: "Completed",
                  tasks: queryState.mainView.completedTasks,
                  emptyText: "No completed tasks match this filter.",
                },
              ]
            : []),
        ]
      : [
          {
            title: "Archived",
            tasks: queryState.archivedTasks,
            emptyText: "No archived tasks yet.",
          },
        ];

  return {
    actions: {
      addTask: (input: TaskDraftFields) => runCommand(() => addTask(input)),
      deleteTask: (taskId: string) => runCommand(() => deleteTask(taskId)),
      moveTask: (taskId: string, taskState: TaskState) =>
        runCommand(() => moveTask(taskId, taskState)),
      updateTask: (taskId: string, input: TaskDraftFields) =>
        runCommand(() => updateTask(taskId, input)),
    },
    archivedView: {
      sort: archivedViewSort,
      setSort: setArchivedViewSort,
    },
    composer: {
      cancel: resetComposer,
      created: resetComposer,
      draft: composerDraft,
      open: composerOpen,
      openNew: () => setComposerOpen(true),
      requestClose: () => setComposerOpen(false),
      updateDraft: setComposerDraft,
    },
    filter,
    isLoading: queryState.isLoading,
    mainView: {
      setShowCompleted,
      setSort: setMainViewSort,
      showCompleted,
      sort: mainViewSort,
    },
    queryErrorMessage: queryState.errorMessage,
    sections,
    setFilter,
    today,
    view,
  };
}

function TaskSurfaceHeader({ title }: { title: string }) {
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
        <Link className={buttonClass(pathname === "/task")} to="/task">
          <Inbox size={16} />
          Tasks
        </Link>
        <Link className={buttonClass(pathname === "/task/archive")} to="/task/archive">
          <Archive size={16} />
          Archive
        </Link>
      </nav>
    </header>
  );
}

function TaskSurfaceControls({
  workflow,
}: {
  workflow: ReturnType<typeof useTaskSurfaceWorkflow>;
}) {
  if (workflow.view === "Archive") {
    return (
      <section
        className="my-4 mb-7 grid gap-3 md:flex md:items-end md:justify-end"
        aria-label="Archive controls"
      >
        <TaskSortSelect
          value={workflow.archivedView.sort}
          onChange={workflow.archivedView.setSort}
        />
      </section>
    );
  }

  return (
    <section className="task-controls" aria-label="Tasks controls">
      <button
        className={buttonClass(true)}
        disabled={workflow.isLoading}
        onClick={workflow.composer.openNew}
        type="button"
      >
        <Plus size={16} />
        Add Task
      </button>
      <SegmentedControl
        label="Task Filter"
        values={filters}
        value={workflow.filter}
        onChange={workflow.setFilter}
      />
      <TaskSortSelect value={workflow.mainView.sort} onChange={workflow.mainView.setSort} />
      <label className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink-muted">
        <input
          checked={workflow.mainView.showCompleted}
          className="h-4 w-4 accent-accent"
          onChange={(event) => workflow.mainView.setShowCompleted(event.target.checked)}
          type="checkbox"
        />
        <span>Show completed</span>
      </label>
    </section>
  );
}

function TaskComposer({
  draft,
  onAdd,
  onCancel,
  onChange,
  onCreated,
}: {
  draft: TaskDraftFields;
  onAdd: (input: TaskDraftFields) => Promise<void>;
  onCancel: () => void;
  onChange: (draft: TaskDraftFields) => void;
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
    <form className="task-form" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-bold text-ink-muted">Title</span>
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
          <span className="text-xs font-bold text-ink-muted">Due Date</span>
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
      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-ink-muted">Note</span>
        <textarea
          aria-label="Note"
          className={cx(fieldClass, "min-h-32 resize-y py-2")}
          placeholder="Add useful context, constraints, links, reminders, or the next small step for this Task."
          value={draft.note}
          onChange={(event) => onChange({ ...draft, note: event.target.value })}
        />
      </label>
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
  draft: TaskDraftFields;
  onAdd: (input: TaskDraftFields) => Promise<void>;
  onCancel: () => void;
  onChange: (draft: TaskDraftFields) => void;
  onClose: () => void;
  onCreated: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasDraftContent = Boolean(draft.title.trim() || draft.note.trim() || draft.dueDate);

  function requestClose() {
    if (!hasDraftContent || window.confirm("Discard this unsaved task draft?")) {
      onClose();
    }
  }

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
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
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
            onClick={requestClose}
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
  onUpdate: (taskId: string, input: TaskDraftFields) => Promise<void>;
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
        <article className="task-row task-row--skeleton animate-pulse" key={item}>
          <div className="h-11 w-11 shrink-0 rounded-md border border-rule-soft bg-app-canvas" />
          <div className="task-row__content pt-1">
            <div className="h-4 w-2/3 max-w-80 rounded bg-rule-soft" />
            <div className="mt-3 h-3 w-full max-w-xl rounded bg-app-canvas" />
            <div className="mt-2 h-3 w-36 rounded bg-app-canvas" />
          </div>
          <div className="task-row__actions">
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
  onUpdate: (taskId: string, input: TaskDraftFields) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [note, setNote] = useState(task.note ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [saving, setSaving] = useState(false);
  const [showTitleRequired, setShowTitleRequired] = useState(false);
  const pastDue = isPastDue(task, today);
  const dueToday = isDueToday(task, today);
  const titleErrorId = `task-${task.id}-title-error`;
  const titleMissing = !title.trim();

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (titleMissing || saving) {
      setShowTitleRequired(true);
      return;
    }
    setSaving(true);
    try {
      await onUpdate(task.id, { title, note, dueDate });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setTitle(task.title);
    setNote(task.note ?? "");
    setDueDate(task.dueDate ?? "");
    setShowTitleRequired(false);
    setEditing(false);
  }

  return (
    <article className={cx("task-row", pastDue && "bg-danger-soft")}>
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
      <div className={cx("task-row__content", editing && "task-row__content--editing")}>
        {editing ? (
          <form className="task-form" onSubmit={save}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-ink-muted">Title</span>
                <input
                  aria-describedby={showTitleRequired ? titleErrorId : undefined}
                  aria-invalid={showTitleRequired}
                  aria-label="Title"
                  className={fieldClass}
                  placeholder="Task Title (required)"
                  value={title}
                  onBlur={() => setShowTitleRequired(titleMissing)}
                  onChange={(event) => {
                    setShowTitleRequired(false);
                    setTitle(event.target.value);
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
                <span className="text-xs font-bold text-ink-muted">Due Date</span>
                <input
                  className={fieldClass}
                  aria-label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
                <span className="min-h-5" aria-hidden="true" />
              </label>
            </div>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-ink-muted">Note</span>
              <textarea
                className={cx(fieldClass, "min-h-24 resize-y py-2")}
                aria-label="Note"
                placeholder="Add useful context, constraints, links, reminders, or the next small step for this Task."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <button className={buttonClass(false)} onClick={cancelEdit} type="button">
                <X size={16} />
                Cancel
              </button>
              <button className={buttonClass(true)} disabled={saving} type="submit">
                <Save size={16} />
                Save
              </button>
            </div>
          </form>
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
      <div className={cx("task-row__actions", editing && "task-row__actions--hidden")}>
        {editing ? null : (
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
