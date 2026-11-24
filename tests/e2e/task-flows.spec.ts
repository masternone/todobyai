import { expect, test, type Locator, type Page } from "@playwright/test";

const testRunId = `E2E ${new Date().toISOString()}`;
const testUserStorageKey = "todo-by-ai-test-user";

type TaskFixture = {
  title: string;
  note: string;
  dueDate: string;
  dueDateKind: "none" | "yesterday" | "today" | "tomorrow";
};

test("shows a public Splash Page at the root route", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Todo by AI" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Task" })).toBeHidden();
});

test("requires sign-in for Tasks and preserves the protected destination", async ({ page }) => {
  await page.goto("/task");

  await expect(page.getByRole("heading", { name: "Sign in to Todo by AI" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/task$/);
  await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
});

test("redirects signed-in Users from Splash and signs out to the Splash Page", async ({ page }) => {
  await signInForTest(page);

  await page.goto("/");
  await expect(page).toHaveURL(/\/task$/);
  await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Todo by AI" })).toBeVisible();
});

test("requires sign-in for Archive and preserves the protected destination", async ({ page }) => {
  await page.goto("/task/archive");

  await expect(page.getByRole("heading", { name: "Sign in to Todo by AI" })).toBeVisible();
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/task\/archive$/);
  await expect(page.getByRole("heading", { exact: true, name: "Archive" })).toBeVisible();
});

test("creates Tasks across required and optional fields, filters them, changes Task State, and deletes them", async ({
  page,
}) => {
  await signInForTest(page);
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

test("keeps Task lists private between signed-in Users", async ({ browser }) => {
  const firstUserContext = await browser.newContext();
  const secondUserContext = await browser.newContext();
  const firstUserPage = await firstUserContext.newPage();
  const secondUserPage = await secondUserContext.newPage();
  const firstUserTask = `${testRunId} first User private Task`;
  const secondUserTask = `${testRunId} second User private Task`;

  try {
    await signInForTest(firstUserPage, "test-user-first");
    await firstUserPage.goto("/task");
    await expect(firstUserPage.getByRole("heading", { name: "Tasks" })).toBeVisible();
    await expect(firstUserPage.getByLabel("Loading Tasks")).toBeHidden();

    await createTask(firstUserPage, {
      title: firstUserTask,
      note: "Only the first signed-in User should see this Task",
      dueDate: "",
      dueDateKind: "none",
    });
    await expect(taskRow(firstUserPage, firstUserTask)).toBeVisible();

    await signInForTest(secondUserPage, "test-user-second");
    await secondUserPage.goto("/task");
    await expect(secondUserPage.getByRole("heading", { name: "Tasks" })).toBeVisible();
    await expect(secondUserPage.getByLabel("Loading Tasks")).toBeHidden();
    await expect(taskRow(secondUserPage, firstUserTask)).toBeHidden();

    await createTask(secondUserPage, {
      title: secondUserTask,
      note: "Only the second signed-in User should see this Task",
      dueDate: "",
      dueDateKind: "none",
    });
    await expect(taskRow(secondUserPage, secondUserTask)).toBeVisible();
    await expect(taskRow(secondUserPage, firstUserTask)).toBeHidden();

    await firstUserPage.reload();
    await expect(taskRow(firstUserPage, firstUserTask)).toBeVisible();
    await expect(taskRow(firstUserPage, secondUserTask)).toBeHidden();
  } finally {
    await deleteCreatedTasks(firstUserPage, [firstUserTask]);
    await deleteCreatedTasks(secondUserPage, [secondUserTask]);
    await firstUserContext.close();
    await secondUserContext.close();
  }
});

for (const width of [390, 1280]) {
  test(`announces a rejected create at ${width}px without hiding the draft`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await signInForTest(page, `test-user-create-error-${width}`);
    await page.goto("/task");
    await page.getByRole("button", { name: "Add Task" }).click();
    const dialog = page.getByRole("dialog", { name: "Add Task" });
    await dialog.getByLabel("Title").fill("Keep the draft when saving fails");
    await dialog.getByLabel("Note").fill("The note and due date should stay here too.");
    await dialog.getByLabel("Due Date").fill("2027-01-15");
    const pending = await holdTaskCommands(page);
    pending.reject();
    await dialog.getByRole("button", { name: "Create", exact: true }).click();
    await expect(dialog.getByRole("alert")).toContainText(
      "Could not confirm whether the task was created",
    );
    await expect(dialog.getByLabel("Title")).toHaveValue("Keep the draft when saving fails");
    const alertBounds = await dialog.getByRole("alert").boundingBox();
    expect(alertBounds).not.toBeNull();
    expect(alertBounds!.x).toBeGreaterThanOrEqual(0);
    expect(alertBounds!.x + alertBounds!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath("failed-create.png"), fullPage: true });
  });
}

test("keeps a failed create draft and retries once without unhandled errors", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await signInForTest(page, "test-user-failed-create");
  await page.goto("/task");
  await page.getByRole("button", { name: "Add Task" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Task" });
  const title = `${testRunId} failed create`;
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Note").fill("Keep this note");
  await dialog.getByLabel("Due Date").fill("2027-01-15");

  const pending = await holdTaskCommands(page);
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await pending.started;
  await expect(dialog.getByRole("button", { name: "Creating…" })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Close Dialog" })).toBeDisabled();
  await expect(dialog.getByLabel("Title")).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  pending.reject();

  await expect(dialog.getByRole("alert")).toContainText(
    "Could not confirm whether the task was created",
  );
  await expect(dialog.getByRole("alert")).toContainText("refresh Tasks before trying again");
  await expect(dialog.getByLabel("Title")).toHaveValue(title);
  await expect(dialog.getByLabel("Note")).toHaveValue("Keep this note");
  await expect(dialog.getByLabel("Due Date")).toHaveValue("2027-01-15");
  await expect(dialog.getByRole("button", { name: "Create", exact: true })).toBeEnabled();
  expect(pending.count()).toBe(1);
  await page.unrouteAll({ behavior: "wait" });
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(taskRow(page, title)).toHaveCount(1);
  await page.reload();
  await expect(taskRow(page, title)).toHaveCount(1);
  expect(pageErrors).toEqual([]);
  await deleteCreatedTasks(page, [title]);
});

test("keeps failed edits in the editor with all entered fields", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await signInForTest(page, "test-user-failed-edit");
  await page.goto("/task");
  const title = `${testRunId} failed edit`;
  await createTask(page, { title, note: "Original note", dueDate: "", dueDateKind: "none" });
  await taskRow(page, title).getByRole("button", { name: "Edit Task" }).click();
  const editor = taskEditor(page);
  await editor.getByLabel("Title").fill(`${title} changed`);
  await editor.getByLabel("Note").fill("Changed note");
  await editor.getByLabel("Due Date").fill("2027-02-03");
  const pending = await holdTaskCommands(page);
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await pending.started;
  await expect(editor.getByRole("button", { name: "Saving…" })).toBeDisabled();
  await expect(editor.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled();
  await expect(editor.getByLabel("Title")).toBeDisabled();
  pending.reject();
  await expect(editor.getByRole("alert")).toContainText("task was saved");
  await expect(editor.getByLabel("Title")).toHaveValue(`${title} changed`);
  await expect(editor.getByLabel("Note")).toHaveValue("Changed note");
  await expect(editor.getByLabel("Due Date")).toHaveValue("2027-02-03");
  await expect(editor.getByRole("button", { name: "Save", exact: true })).toBeEnabled();
  await expect(editor.getByRole("button", { name: "Complete Task" })).toBeDisabled();
  await page.unrouteAll({ behavior: "wait" });
  await editor.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    taskRow(page, `${title} changed`).getByRole("button", { name: "Edit Task" }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
  await deleteCreatedTasks(page, [`${title} changed`]);
});

test("keeps failed delete confirmation open until deletion succeeds", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await signInForTest(page, "test-user-failed-delete");
  await page.goto("/task");
  const title = `${testRunId} failed delete`;
  await createTask(page, { title, note: "", dueDate: "", dueDateKind: "none" });
  await taskRow(page, title).getByRole("button", { name: "Delete Task" }).click();
  const dialog = page.getByRole("dialog", { name: /Delete/ });
  const pending = await holdTaskCommands(page);
  await dialog.getByRole("button", { name: "Delete Task", exact: true }).click();
  await pending.started;
  await expect(dialog.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Keep Task" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  pending.reject();
  await expect(dialog.getByRole("alert")).toContainText("task was deleted");
  await expect(dialog.getByRole("button", { name: "Delete Task", exact: true })).toBeEnabled();
  await expect(taskRow(page, title)).toBeVisible();
  await page.unrouteAll({ behavior: "wait" });
  await dialog.getByRole("button", { name: "Delete Task", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(taskRow(page, title)).toBeHidden();
  expect(pageErrors).toEqual([]);
});

for (const action of ["complete", "archive", "restore completed", "restore archived"] as const) {
  test(`reports a failed ${action} without changing Task state`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    await signInForTest(page, `test-user-failed-${action.replace(" ", "-")}`);
    await page.goto("/task");
    const title = `${testRunId} failed ${action}`;
    await createTask(page, { title, note: "", dueDate: "", dueDateKind: "none" });
    if (action === "restore completed") {
      await completeTask(page, title);
      await page.getByLabel("Show completed").check();
    } else if (action === "restore archived") {
      await archiveTask(page, title);
      await page.getByRole("link", { name: "Archive" }).click();
    }
    const row = taskRow(page, title);
    const buttonName =
      action === "complete"
        ? "Complete Task"
        : action === "archive"
          ? "Archive Task"
          : "Restore Task";
    const pending = await holdTaskCommands(page);
    await row.getByRole("button", { name: buttonName }).first().click();
    await pending.started;
    await expect(row).toHaveAttribute("aria-busy", "true");
    await expect(row.locator("button:enabled")).toHaveCount(0);
    pending.reject();
    await expect(row.getByRole("alert")).toContainText("Could not confirm whether");
    await expect(row.getByRole("button", { name: buttonName }).first()).toBeEnabled();
    await expect(row).toHaveAttribute("aria-busy", "false");
    await page.unrouteAll({ behavior: "wait" });
    await row.getByRole("button", { name: buttonName }).first().click();
    if (action === "restore completed") {
      await expect(taskList(page, "Active").getByText(title)).toBeVisible();
    } else {
      await expect(row).toBeHidden();
    }
    expect(pageErrors).toEqual([]);
    await deleteCreatedTasks(page, [title]);
  });
}

test("reports a saved create separately from a failed refresh", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await signInForTest(page, "test-user-saved-refresh-failed");
  await page.goto("/task");
  await expect(page.getByRole("button", { name: "Add Task" })).toBeEnabled();
  let commandCount = 0;
  await page.route("**/_serverFn/**", (route) => {
    if (route.request().method() === "GET") return route.abort("failed");
    commandCount += 1;
    return route.continue();
  });
  const title = `${testRunId} saved refresh failed`;
  await createTask(page, { title, note: "", dueDate: "", dueDateKind: "none" });
  await expect(page.getByRole("alert")).toContainText("Your change was saved");
  await page.getByRole("button", { name: "Refresh Tasks", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Your change was saved");
  await expect(page.getByRole("button", { name: "Refresh Tasks", exact: true })).toBeEnabled();
  expect(commandCount).toBe(1);
  await page.unrouteAll({ behavior: "wait" });
  await page.getByRole("button", { name: "Refresh Tasks", exact: true }).click();
  await expect(taskRow(page, title)).toHaveCount(1);
  await expect(page.getByRole("alert")).toBeHidden();
  expect(pageErrors).toEqual([]);
  await deleteCreatedTasks(page, [title]);
});

test("does not retry a create automatically when its response is lost", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await signInForTest(page, "test-user-lost-create-response");
  await page.goto("/task");
  let commandCount = 0;
  await page.route("**/_serverFn/**", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    commandCount += 1;
    await route.fetch();
    await route.abort("failed");
  });
  await page.getByRole("button", { name: "Add Task" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Task" });
  const title = `${testRunId} lost response`;
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Could not confirm whether the task was created",
  );
  await expect(dialog.getByLabel("Title")).toHaveValue(title);
  expect(commandCount).toBe(1);
  await page.unrouteAll({ behavior: "wait" });
  await page.reload();
  await expect(taskRow(page, title)).toHaveCount(1);
  expect(pageErrors).toEqual([]);
  await deleteCreatedTasks(page, [title]);
});

async function holdTaskCommands(page: Page) {
  let markStarted = () => {};
  let reject = () => {};
  let count = 0;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const held = new Promise<void>((resolve) => {
    reject = resolve;
  });
  await page.route("**/_serverFn/**", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    count += 1;
    markStarted();
    await held;
    await route.abort("failed");
  });
  return { started, reject, count: () => count };
}

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
  for (const view of ["Tasks", "Archive"]) {
    await page.getByRole("link", { name: view }).click();
    await expect(page.getByRole("heading", { name: view, level: 1, exact: true })).toBeVisible();
    for (const title of taskTitles) {
      const row = taskRow(page, title);
      if (await row.isVisible()) {
        await row.getByRole("button", { name: "Delete Task" }).click();
        await page
          .getByRole("dialog", { name: /Delete/ })
          .getByRole("button", {
            name: "Delete Task",
          })
          .click();
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
  return page.locator("article").filter({ has: page.locator("form") });
}

async function signInForTest(page: Page, userId = "test-user") {
  await page.addInitScript(
    ({ storageKey, signedInUserId }) => {
      window.localStorage.setItem(storageKey, signedInUserId);
      document.cookie = `${storageKey}=${encodeURIComponent(signedInUserId)}; Path=/; SameSite=Lax`;
    },
    { storageKey: testUserStorageKey, signedInUserId: userId },
  );
}
