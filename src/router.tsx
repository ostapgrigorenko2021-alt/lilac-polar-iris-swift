import { createRouter, createRoute, rootRoute } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";
import { CalendarPage } from "@/pages/calendar"; // Напрямую подключаем твой новый файл

// Создаем жесткий и надежный маршрут для календаря
const calendarRoute = createRoute({
  getParentRoute: () => routeTree,
  path: "/calendar",
  component: CalendarPage,
});

// Добавляем календарь в общее дерево роутера
const updatedRouteTree = routeTree.addChildren([calendarRoute]);

export function getRouter() {
  return createRouter({ 
    routeTree: updatedRouteTree, 
    defaultErrorComponent: AppErrorComponent 
  });
}
