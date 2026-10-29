import { OrgPage } from "@/pages/org";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org")({ component: OrgPage });
