import { createRouter, createRoute } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";
import { CalendarPage } from "./pages/calendar";

const calendarRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/calendar",
  component: CalendarPage,
});

const updatedRouteTree = routeTree.addChildren([calendarRoute]);

export function getRouter() {
  return createRouter({ 
    routeTree: updatedRouteTree, 
    defaultErrorComponent: AppErrorComponent 
  });
}
