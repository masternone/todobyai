import { expect, test, type Locator, type Page } from "@playwright/test";

async function openTasks(page: Page, userId: string) {
  await page.addInitScript((identity) => {
    localStorage.setItem("todo-by-ai-test-user", identity);
  }, userId);
  await page
    .context()
    .addCookies([{ name: "todo-by-ai-test-user", value: userId, url: "http://127.0.0.1:4173" }]);
  await page.goto("/task");
  await expect(page.getByRole("button", { name: "Add Task" })).toBeEnabled();
}

async function createTask(page: Page, title: string, dueDate = "") {
  await page.getByRole("button", { name: "Add Task" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Task" });
  await dialog.getByRole("textbox", { name: "Title", exact: true }).fill(title);
  await dialog.getByLabel("Due Date", { exact: true }).fill(dueDate);
  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect(dialog).toBeHidden();
  return page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) });
}

async function contrastRatio(element: Locator, foreground: "color" | "borderTopColor") {
  return element.evaluate((target, property) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const luminance = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const channels = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
      const linear = channels.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    };
    const style = getComputedStyle(target);
    const first = luminance(style[property]);
    const second = luminance(style.backgroundColor);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  }, foreground);
}

test("audit: filters expose their selected state to assistive technology", async ({
  page,
}, testInfo) => {
  await openTasks(page, `audit-filters-${testInfo.workerIndex}-${Date.now()}`);
  const filters = page.getByRole("group", { name: "Task Filter" });
  await expect(filters.getByRole("button", { name: "All", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  for (const name of ["Past Due", "Due Today", "All"]) {
    const selected = filters.getByRole("button", { name, exact: true });
    await selected.focus();
    await selected.press("Space");
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(filters.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(filters.locator('[aria-pressed="false"]')).toHaveCount(2);
  }
});

test("audit: composer restores focus after cancel, Escape, close, discard, and create", async ({
  page,
}, testInfo) => {
  await openTasks(page, `audit-focus-${testInfo.workerIndex}-${Date.now()}`);
  const opener = page.getByRole("button", { name: "Add Task" });
  const dialog = page.getByRole("dialog", { name: "Add Task" });
  for (const action of ["Cancel", "Escape", "Close Dialog"]) {
    await opener.click();
    await expect(dialog.getByRole("textbox", { name: "Title", exact: true })).toBeFocused();
    if (action === "Escape") {
      await page.keyboard.press("Escape");
    } else {
      await dialog.getByRole("button", { name: action, exact: true }).click();
    }
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  }
  await opener.click();
  await dialog.getByRole("textbox", { name: "Title", exact: true }).fill("Keep my draft");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Keep Editing" })).toBeFocused();
  await dialog.getByRole("button", { name: "Keep Editing" }).click();
  await expect(dialog.getByRole("textbox", { name: "Title", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await dialog.getByRole("button", { name: "Discard Draft" }).click();
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await createTask(page, "Focus after creation");
  await expect(opener).toBeFocused();
});

test("audit: long titles reflow in active, completed, archived, and delete views", async ({
  page,
}, testInfo) => {
  await openTasks(page, `audit-reflow-${testInfo.workerIndex}-${Date.now()}`);
  const title = "T".repeat(120);
  const row = await createTask(page, title);
  async function expectReflow() {
    for (const width of [320, 375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(row.getByRole("heading", { name: title })).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
    }
  }
  await expectReflow();
  await row.getByRole("button", { name: "Complete Task", exact: true }).click();
  await page.getByLabel("Show completed").check();
  await expect(row).toBeVisible();
  await expectReflow();
  await row.getByRole("button", { name: "Archive Task", exact: true }).click();
  await page.getByRole("link", { name: "Archive", exact: true }).click();
  await expect(row).toBeVisible();
  await expectReflow();
  await page.setViewportSize({ width: 320, height: 900 });
  await row.getByRole("button", { name: "Delete Task", exact: true }).click();
  await expect(page.getByRole("dialog", { name: /Delete/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole("button", { name: "Keep Task", exact: true }).click();
});

test("audit: overdue rows use the danger background without recoloring ordinary rows", async ({
  page,
}, testInfo) => {
  await openTasks(page, `audit-overdue-${testInfo.workerIndex}-${Date.now()}`);
  const overdue = await createTask(page, "Overdue task", "2000-01-01");
  const ordinary = await createTask(page, "Ordinary task");
  await expect(overdue.getByText("Past Due", { exact: true })).toBeVisible();
  const expectedColors = await page.evaluate(() => {
    const probe = document.createElement("span");
    document.body.append(probe);
    probe.style.backgroundColor = "var(--color-danger-soft)";
    const danger = getComputedStyle(probe).backgroundColor;
    probe.style.backgroundColor = "var(--color-surface)";
    const surface = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return { danger, surface };
  });
  await expect(overdue).toHaveCSS("background-color", expectedColors.danger);
  await expect(ordinary).toHaveCSS("background-color", expectedColors.surface);
});

test("audit: action text and essential control boundaries have sufficient contrast", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  expect(
    await contrastRatio(page.getByRole("button", { name: "Sign in", exact: true }), "color"),
  ).toBeGreaterThanOrEqual(4.5);
  await openTasks(page, `audit-contrast-${testInfo.workerIndex}-${Date.now()}`);
  expect(
    await contrastRatio(page.getByRole("button", { name: "Add Task" }), "color"),
  ).toBeGreaterThanOrEqual(4.5);
  const row = await createTask(page, "Control contrast");
  expect(
    await contrastRatio(
      row.getByRole("button", { name: "Complete Task", exact: true }),
      "borderTopColor",
    ),
  ).toBeGreaterThanOrEqual(3);
  const checkbox = page
    .getByText("Show completed", { exact: true })
    .locator("..")
    .locator('[aria-hidden="true"]');
  expect(await contrastRatio(checkbox, "borderTopColor")).toBeGreaterThanOrEqual(3);
  await page.getByRole("button", { name: "Add Task" }).click();
  const title = page
    .getByRole("dialog", { name: "Add Task" })
    .getByRole("textbox", { name: "Title", exact: true });
  expect(await contrastRatio(title, "borderTopColor")).toBeGreaterThanOrEqual(3);
});

test("audit: public page declares a description and a working favicon", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Tasks/i);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.svg");
  const declaredIcon = await request.get("/favicon.svg");
  expect(declaredIcon.ok()).toBeTruthy();
  expect(declaredIcon.headers()["content-type"]).toContain("image/svg+xml");
  expect((await request.get("/favicon.ico")).ok()).toBeTruthy();
});

test("audit: test authentication does not download the Clerk browser implementation", async ({
  page,
}) => {
  const clerkScripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script" && /clerk/i.test(request.url())) {
      clerkScripts.push(request.url());
    }
  });
  await page.goto("/");
  await openTasks(page, `audit-bundle-${Date.now()}`);
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Add Task" })).toBeEnabled();
  expect(clerkScripts).toEqual([]);
});
