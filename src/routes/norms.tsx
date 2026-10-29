import { NormsPage } from "@/pages/norms";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/norms")({ component: NormsPage });
