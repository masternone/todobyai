import { createFileRoute } from "@tanstack/react-router";
import { TaskSurface } from "../taskSurface";
import { loadTaskView } from "../client/taskClient";

export const Route = createFileRoute("/task/")({
  loader: () => loadTaskView({ data: "Tasks" }),
  gcTime: 0,
  staleTime: 0,
  component: TasksRoute,
});

function TasksRoute() {
  return <TaskSurface initialTasks={Route.useLoaderData()} view="Tasks" />;
}
