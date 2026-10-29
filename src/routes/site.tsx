import { SitePage } from "@/pages/site";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/site")({ component: SitePage });
