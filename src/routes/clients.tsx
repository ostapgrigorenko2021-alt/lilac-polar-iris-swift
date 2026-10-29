import { ClientsPage } from "@/pages/clients";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/clients")({ component: ClientsPage });
