import { expect, test, type Locator, type Page } from "@playwright/test";

const testRunId = `E2E ${new Date().toISOString()}`;

type TaskFixture = {
  title: string;
  note: string;
  dueDate: string;
  dueDateKind: "none" | "yesterday" | "today" | "tomorrow";
};

test("shows a public Splash Page at the root route", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Todo by AI" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Task" })).toBeHidden();
});

test("creates Tasks across required and optional fields, filters them, changes Task State, and deletes them", async ({
  page,
}) => {
  const dates = await relativeDates(page);
  const tasks = buildTaskMatrix(dates);

  await page.goto("/task");
  await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
  await expect(page.getByLabel("Loading Tasks")).toBeHidden();

  await verifyTitleRequiredNotification(page);

  for (const task of tasks) {
    await createTask(page, task);
    await expect(taskRow(page, task.title)).toBeVisible();
  }

  const finalTaskTitles = await verifyEditBehaviors(page, tasks, dates.tomorrow);

  await expectTaskTitles(page, "Active", finalTaskTitles);
  await expectTaskTitles(
    page,
    "Active",
    tasks.filter((task) => task.dueDateKind === "yesterday").map((task) => task.title),
    { filter: "Past Due" },
  );
  await expectTaskTitles(
    page,
    "Active",
    tasks.filter((task) => task.dueDateKind === "today").map((task) => task.title),
    { filter: "Due Today" },
  );

  await page.getByRole("button", { name: "All" }).click();
  await archiveTask(page, finalTaskTitles[0]);
  await expect(taskRow(page, finalTaskTitles[0])).toBeHidden();
  await page.getByRole("link", { name: "Archive" }).click();
  await expect(page).toHaveURL(/\/task\/archive$/);
  await expect(taskRow(page, finalTaskTitles[0])).toBeVisible();
  await restoreTask(page, finalTaskTitles[0], { leavesCurrentView: true });
  await page.getByRole("link", { name: "Tasks" }).click();
  await expect(page).toHaveURL(/\/task$/);
  await expect(taskRow(page, finalTaskTitles[0])).toBeVisible();

  await completeTask(page, tasks[1].title);
  await completeTask(page, tasks[2].title);
  await page.getByLabel("Show completed").check();
  await expect(taskList(page, "Completed").getByText(tasks[1].title)).toBeVisible();
  await expect(taskList(page, "Completed").getByText(tasks[2].title)).toBeVisible();

  await archiveTask(page, tasks[1].title);
  await expect(taskList(page, "Completed").getByText(tasks[1].title)).toBeHidden();

  await page.getByRole("link", { name: "Archive" }).click();
  await expect(page).toHaveURL(/\/task\/archive$/);
  await expect(taskRow(page, tasks[1].title)).toBeVisible();
  await restoreTask(page, tasks[1].title, { leavesCurrentView: true });
  await page.getByRole("link", { name: "Tasks" }).click();
  await expect(page).toHaveURL(/\/task$/);
  await page.getByLabel("Show completed").check();
  await restoreTask(page, tasks[2].title, { leavesCurrentView: false });
  await expect(taskList(page, "Active").getByText(tasks[1].title)).toBeVisible();
  await expect(taskList(page, "Active").getByText(tasks[2].title)).toBeVisible();

  await deleteCreatedTasks(page, finalTaskTitles);
});

function buildTaskMatrix(dates: {
  yesterday: string;
  today: string;
  tomorrow: string;
}): TaskFixture[] {
  const dueDates: Array<Pick<TaskFixture, "dueDate" | "dueDateKind">> = [
    { dueDate: "", dueDateKind: "none" },
    { dueDate: dates.yesterday, dueDateKind: "yesterday" },
    { dueDate: dates.today, dueDateKind: "today" },
    { dueDate: dates.tomorrow, dueDateKind: "tomorrow" },
  ];
  return dueDates.flatMap((dueDate) => [
    {
      ...dueDate,
      title: `${testRunId} ${dueDate.dueDateKind} title-only`,
      note: "",
    },
    {
      ...dueDate,
      title: `${testRunId} ${dueDate.dueDateKind} with-note`,
      note: `Note for ${dueDate.dueDateKind}`,
    },
  ]);
}

async function relativeDates(page: Page) {
  return page.evaluate(() => {
    const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return {
      yesterday: toDateInputValue(yesterday),
      today: toDateInputValue(today),
      tomorrow: toDateInputValue(tomorrow),
    };
  });
}

async function verifyTitleRequiredNotification(page: Page) {
  await page.getByRole("button", { name: "Add Task" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Task" });
  await expect(dialog.getByPlaceholder("Task Title (required)")).toBeVisible();
  await dialog.getByRole("button", { name: "Create" }).click();
  await expect(dialog.getByText("Title is required.")).toBeVisible();
  await expect(dialog.getByLabel("Title")).toHaveAttribute("aria-invalid", "true");
  await dialog.getByRole("button", { name: "Cancel" }).click();
}

async function createTask(page: Page, task: TaskFixture) {
  await page.getByRole("button", { name: "Add Task" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Task" });
  await dialog.getByLabel("Title").fill(task.title);
  if (task.dueDate) {
    await dialog.getByLabel("Due Date").fill(task.dueDate);
  }
  if (task.note) {
    await dialog.getByLabel("Note").fill(task.note);
  }
  await dialog.getByRole("button", { name: "Create" }).click();
  await expect(dialog).toBeHidden();
}

async function verifyEditBehaviors(page: Page, tasks: TaskFixture[], dueDate: string) {
  const task = tasks[0];
  const editedTask = {
    title: `${task.title} edited`,
    note: "Edited note through the inline Task form",
    dueDate,
  };

  await page.getByRole("button", { name: "All" }).click();
  const row = taskRow(page, task.title);
  await row.getByRole("button", { name: "Edit Task" }).click();
  const editor = taskEditor(page);

  await expect(editor.getByPlaceholder("Task Title (required)")).toBeVisible();
  await editor.getByLabel("Title").fill("");
  await editor.getByRole("button", { name: "Save" }).click();
  await expect(editor.getByText("Title is required.")).toBeVisible();
  await expect(editor.getByLabel("Title")).toHaveAttribute("aria-invalid", "true");

  await editor.getByLabel("Title").fill("Temporary title that should be cancelled");
  await editor.getByLabel("Note").fill("Temporary note that should be cancelled");
  await editor.getByLabel("Due Date").fill(dueDate);
  await editor.getByRole("button", { name: "Cancel" }).click();
  await expect(taskRow(page, task.title)).toBeVisible();
  await expect(page.getByText("Temporary title that should be cancelled")).toBeHidden();

  await row.getByRole("button", { name: "Edit Task" }).click();
  await taskEditor(page).getByLabel("Title").fill(editedTask.title);
  await taskEditor(page).getByLabel("Note").fill(editedTask.note);
  await taskEditor(page).getByLabel("Due Date").fill(editedTask.dueDate);
  await taskEditor(page).getByRole("button", { name: "Save" }).click();
  await expect(taskRow(page, editedTask.title)).toBeVisible();
  await expect(taskRow(page, editedTask.title).getByText(editedTask.note)).toBeVisible();
  await expect(taskRow(page, editedTask.title).getByText(editedTask.dueDate)).toBeVisible();

  const editedRow = taskRow(page, editedTask.title);
  await editedRow.getByRole("button", { name: "Edit Task" }).click();
  await taskEditor(page).getByLabel("Note").fill("");
  await taskEditor(page).getByLabel("Due Date").fill("");
  await taskEditor(page).getByRole("button", { name: "Save" }).click();
  await expect(taskRow(page, editedTask.title).getByText(editedTask.note)).toBeHidden();
  await expect(taskRow(page, editedTask.title).getByText(editedTask.dueDate)).toBeHidden();

  return tasks.map((fixture) => (fixture.title === task.title ? editedTask.title : fixture.title));
}

async function expectTaskTitles(
  page: Page,
  listName: string,
  expectedTitles: string[],
  options?: { filter?: "All" | "Past Due" | "Due Today" },
) {
  if (options?.filter) {
    await page.getByRole("button", { name: options.filter }).click();
  }
  const list = taskList(page, listName);
  for (const title of expectedTitles) {
    await expect(list.getByText(title)).toBeVisible();
  }
  await expect(list.locator("article").filter({ hasText: testRunId })).toHaveCount(
    expectedTitles.length,
  );
}

async function completeTask(page: Page, title: string) {
  await taskRow(page, title).getByRole("button", { name: "Complete Task" }).click();
  await expect(taskList(page, "Active").getByText(title)).toBeHidden();
}

async function archiveTask(page: Page, title: string) {
  await taskRow(page, title).getByRole("button", { name: "Archive Task" }).click();
  await expect(taskRow(page, title)).toBeHidden();
}

async function restoreTask(page: Page, title: string, options: { leavesCurrentView: boolean }) {
  await expect(taskRow(page, title)).toBeVisible();
  await taskRow(page, title).getByRole("button", { name: "Restore Task" }).first().click();
  if (options.leavesCurrentView) {
    await expect(taskRow(page, title)).toBeHidden();
  }
}

async function deleteCreatedTasks(page: Page, taskTitles: string[]) {
  page.on("dialog", (dialog) => dialog.accept());
  for (const view of ["Tasks", "Archive"]) {
    await page.getByRole("link", { name: view }).click();
    for (const title of taskTitles) {
      const row = taskRow(page, title);
      if (await row.isVisible()) {
        await row.getByRole("button", { name: "Delete Task" }).click();
        await expect(row).toBeHidden();
      }
    }
  }
}

function taskList(page: Page, name: string): Locator {
  return page.locator("section").filter({ has: page.getByRole("heading", { name }) });
}

function taskRow(page: Page, title: string): Locator {
  return page.locator("article").filter({ hasText: title });
}

function taskEditor(page: Page): Locator {
  return page.locator("article").filter({ has: page.getByRole("button", { name: "Save" }) });
}
