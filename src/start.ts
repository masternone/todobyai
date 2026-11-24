import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createCsrfMiddleware, createIsomorphicFn, createStart } from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
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
  requestMiddleware: [csrfMiddleware, ...getClerkRequestMiddleware()],
}));
