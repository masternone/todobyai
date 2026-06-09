import type { ReactNode } from "react";
import { HeadContent, Navigate, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { TaskAppShell } from "../taskApp";
import "../styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Todo by AI" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <Navigate to="/" replace />,
});

function RootComponent() {
  return (
    <RootDocument>
      <TaskAppShell>
        <Outlet />
      </TaskAppShell>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
