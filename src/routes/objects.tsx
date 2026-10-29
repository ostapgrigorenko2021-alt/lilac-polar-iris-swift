import { ObjectsPage } from "@/pages/objects";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/objects")({ component: ObjectsPage });
