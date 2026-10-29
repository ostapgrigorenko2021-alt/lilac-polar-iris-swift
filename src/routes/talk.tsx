import { TalkPage } from "@/pages/talk";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/talk")({ component: TalkPage });
