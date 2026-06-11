import { auth } from "@clerk/tanstack-react-start/server";
import type { User } from "../domain/task";

export type CurrentUserProvider = () => Promise<User>;

export class AuthenticationRequiredError extends Error {
  constructor(message = "Sign in to access Tasks.") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export async function getCurrentUserFromSession(): Promise<User> {
  if (process.env.VITE_TODO_BY_AI_AUTH_MODE === "test") {
    return { id: process.env.TODO_BY_AI_TEST_USER_ID ?? "test-user" };
  }

  const session = await getClerkSession();
  if (!session.userId) {
    throw new AuthenticationRequiredError();
  }

  return { id: session.userId };
}

async function getClerkSession() {
  try {
    return await auth();
  } catch (error) {
    if (!process.env.VITE_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
      throw new AuthenticationRequiredError(
        "Authentication is not configured. Add VITE_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to access Tasks.",
      );
    }
    throw error;
  }
}
