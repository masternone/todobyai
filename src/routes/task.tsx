import { Outlet, createFileRoute } from "@tanstack/react-router";
import { RequireSignedIn } from "../auth";
import { TaskAppShell } from "../taskApp";

export const Route = createFileRoute("/task")({
  component: TaskRouteLayout,
});

function TaskRouteLayout() {
  return (
    <RequireSignedIn>
      <TaskAppShell>
        <Outlet />
      </TaskAppShell>
    </RequireSignedIn>
  );
}
