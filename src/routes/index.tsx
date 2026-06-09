import { createFileRoute } from "@tanstack/react-router";
import { MainViewRoute } from "../taskApp";

export const Route = createFileRoute("/")({
  component: MainViewRoute,
});
