import { WorkerPage } from "@/pages/worker";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/worker/$id")({
  component: function WorkerRoute() {
    const { id } = Route.useParams();
    return <WorkerPage id={id} />;
  },
});
