import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

const hasClerkServerConfig = Boolean(
  process.env.VITE_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});
const clerkRequestMiddleware =
  process.env.VITE_TODO_BY_AI_AUTH_MODE === "test" || !hasClerkServerConfig
    ? []
    : [clerkMiddleware()];

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, ...clerkRequestMiddleware],
}));
