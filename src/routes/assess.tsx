import { AssessPage } from "@/pages/assess";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/assess")({ component: AssessPage });
