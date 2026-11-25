import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import {
  createCsrfMiddleware,
  createIsomorphicFn,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});
const privateTaskResponses = createMiddleware().server(async ({ request, next }) => {
  const result = await next();
  const path = new URL(request.url).pathname;
  if (path === "/task" || path.startsWith("/task/") || path.startsWith("/_serverFn/")) {
    result.response.headers.set("Cache-Control", "private, no-store");
  }
  return result;
});
const getClerkRequestMiddleware = createIsomorphicFn()
  .server(() => {
    const hasClerkServerConfig = Boolean(
      process.env.VITE_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
    );
    return process.env.VITE_TODO_BY_AI_AUTH_MODE === "test" || !hasClerkServerConfig
      ? []
      : [clerkMiddleware()];
  })
  .client(() => []);

export const startInstance = createStart(() => ({
  requestMiddleware: [privateTaskResponses, csrfMiddleware, ...getClerkRequestMiddleware()],
}));
