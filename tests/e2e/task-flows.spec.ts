import { expect, test, type Locator, type Page } from "@playwright/test";

const testRunId = `E2E ${new Date().toISOString()}`;

type TaskFixture = {
  title: string;
  note: string;
  dueDate: string;
  dueDateKind: "none" | "yesterday" | "today" | "tomorrow";
};

test("creates Tasks across required and optional fields, filters them, changes Task State, and deletes them", async ({
  page,
}) => {
  const dates = await relativeDates(page);
  const tasks = buildTaskMatrix(dates);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Main View" })).toBeVisible();
  await expect(page.getByLabel("Loading Tasks")).toBeHidden();

  await verifyTitleRequiredNotification(page);

  for (const task of tasks) {
    await createTask(page, task);
    await expect(taskRow(page, task.title)).toBeVisible();
  }

  await expectTaskTitles(
    page,
    "Active",
    tasks.map((task) => task.title),
  );
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
  await archiveTask(page, tasks[0].title);
  await expect(taskRow(page, tasks[0].title)).toBeHidden();
  await page.getByRole("link", { name: "Archived" }).click();
  await expect(taskRow(page, tasks[0].title)).toBeVisible();
  await restoreTask(page, tasks[0].title, { leavesCurrentView: true });
  await page.getByRole("link", { name: "Main" }).click();
  await expect(taskRow(page, tasks[0].title)).toBeVisible();

  await completeTask(page, tasks[1].title);
  await completeTask(page, tasks[2].title);
  await page.getByLabel("Completed Section").check();
  await expect(taskList(page, "Completed").getByText(tasks[1].title)).toBeVisible();
  await expect(taskList(page, "Completed").getByText(tasks[2].title)).toBeVisible();

  await archiveTask(page, tasks[1].title);
  await expect(taskList(page, "Completed").getByText(tasks[1].title)).toBeHidden();

  await page.getByRole("link", { name: "Archived" }).click();
  await expect(taskRow(page, tasks[1].title)).toBeVisible();
  await restoreTask(page, tasks[1].title, { leavesCurrentView: true });
  await page.getByRole("link", { name: "Main" }).click();
  await page.getByLabel("Completed Section").check();
  await restoreTask(page, tasks[2].title, { leavesCurrentView: false });
  await expect(taskList(page, "Active").getByText(tasks[1].title)).toBeVisible();
  await expect(taskList(page, "Active").getByText(tasks[2].title)).toBeVisible();

  await deleteCreatedTasks(page, tasks);
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

async function deleteCreatedTasks(page: Page, tasks: TaskFixture[]) {
  page.on("dialog", (dialog) => dialog.accept());
  for (const view of ["Main", "Archived"]) {
    await page.getByRole("link", { name: view }).click();
    for (const task of tasks) {
      const row = taskRow(page, task.title);
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
