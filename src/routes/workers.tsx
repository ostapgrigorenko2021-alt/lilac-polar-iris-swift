import { WorkersPage } from "@/pages/workers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workers")({ component: WorkersPage });
