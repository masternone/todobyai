import { createFileRoute } from "@tanstack/react-router";
import { TaskSurface } from "../taskSurface";
import { loadTaskView } from "../client/taskClient";

export const Route = createFileRoute("/task/archive")({
  loader: () => loadTaskView({ data: "Archive" }),
  gcTime: 0,
  staleTime: 0,
  component: ArchiveRoute,
});

function ArchiveRoute() {
  return <TaskSurface initialTasks={Route.useLoaderData()} view="Archive" />;
}
