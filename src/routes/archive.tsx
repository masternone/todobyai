import { createFileRoute } from "@tanstack/react-router";
import { ArchiveViewRoute } from "../taskApp";

export const Route = createFileRoute("/archive")({
  component: ArchiveViewRoute,
});
