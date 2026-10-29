import { PricePage } from "@/pages/price";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/price")({
  validateSearch: (search: Record<string, unknown>) => ({
    pick: search.pick === "1" ? "1" : "",
  }),
  component: function PriceRoute() {
    const { pick } = Route.useSearch();
    return <PricePage pick={pick === "1"} />;
  },
});
