import { createFileRoute } from "@tanstack/react-router";
import { TaskSurface } from "../taskSurface";

export const Route = createFileRoute("/task/archive")({
  component: ArchiveRoute,
});

function ArchiveRoute() {
  return <TaskSurface view="Archive" />;
}
