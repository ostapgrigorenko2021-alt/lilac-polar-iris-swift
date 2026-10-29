import { ItemPage } from "@/pages/item";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/item/$id")({
  component: function ItemRoute() {
    const { id } = Route.useParams();
    return <ItemPage id={id} />;
  },
});
