import { ClientPage } from "@/pages/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/client/$id")({
  component: function ClientRoute() {
    const { id } = Route.useParams();
    return <ClientPage id={id} />;
  },
});
