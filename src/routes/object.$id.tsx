import { ObjectPage } from "@/pages/object";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/object/$id")({
  component: function ObjectRoute() {
    const { id } = Route.useParams();
    return <ObjectPage id={id} />;
  },
});
