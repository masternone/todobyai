import { Outlet, createFileRoute } from "@tanstack/react-router";
import { TaskAppShell } from "../taskApp";

export const Route = createFileRoute("/task")({
  component: TaskRouteLayout,
});

function TaskRouteLayout() {
  return (
    <TaskAppShell>
      <Outlet />
    </TaskAppShell>
  );
}
