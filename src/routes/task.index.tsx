import { createFileRoute } from "@tanstack/react-router";
import { TaskSurface } from "../taskSurface";

export const Route = createFileRoute("/task/")({
  component: TasksRoute,
});

function TasksRoute() {
  return <TaskSurface view="Tasks" />;
}
