import { describe, expect, it } from "vitest";
import { taskActionError } from "./taskActionError";

describe("taskActionError", () => {
  it.each(["create", "save", "complete", "archive", "restore", "delete"] as const)(
    "gives safe recovery advice for an unconfirmed %s",
    (action) => {
      const message = taskActionError(new TypeError("Failed to fetch"), action);
      expect(message).toContain("Could not confirm whether");
      expect(message).toContain("refresh Tasks before trying again");
      expect(message).not.toContain("Failed to fetch");
    },
  );

  it("does not expose server details or assume a write failed", () => {
    const message = taskActionError(new Error("SQL failure: private database path"), "create");
    expect(message).toContain("Could not confirm whether the task was created");
    expect(message).not.toContain("SQL");
    expect(taskActionError(null, "delete")).toContain("task was deleted");
  });

  it("recognizes authentication errors including serialized server errors", () => {
    const error = new Error("Authentication is not configured. Secret settings.");
    error.name = "AuthenticationRequiredError";
    expect(taskActionError(error, "save")).toBe(
      "Sign in again before you save the task. Your changes are still here.",
    );
    expect(taskActionError(new Error("Sign in to access Tasks."), "create")).toContain(
      "Sign in again before you create",
    );
  });

  it("keeps expected validation feedback actionable", () => {
    expect(taskActionError(new Error("Title is required."), "save")).toBe(
      "Title is required. Enter a title and try again.",
    );
  });
});
