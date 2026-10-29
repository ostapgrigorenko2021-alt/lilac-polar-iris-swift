import { useStore } from "@/components/store";
import { tr } from "@/lib/format";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Calculator,
  ClipboardList,
  HardHat,
  Home,
  Menu,
  MessageSquare,
  Moon,
  Ruler,
  Settings,
  Sun,
  Timer,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const LINKS = [
  { to: "/", uk: "Головна", ru: "Главная", icon: Home },
  { to: "/assess", uk: "Оцінка", ru: "Оценка", icon: ClipboardList },
  { to: "/calc", uk: "Ціна", ru: "Цена", icon: Calculator },
  { to: "/price", uk: "Прайс", ru: "Прайс", icon: BookOpen },
  { to: "/objects", uk: "Об'єкти", ru: "Объекты", icon: HardHat },
  { to: "/clients", uk: "Клієнти", ru: "Клиенты", icon: UserRound },
  { to: "/workers", uk: "Робітники", ru: "Рабочие", icon: Users },
  { to: "/site", uk: "На об'єкті", ru: "На объекте", icon: Timer },
  { to: "/talk", uk: "Переговори", ru: "Переговоры", icon: MessageSquare },
  { to: "/norms", uk: "Норми", ru: "Нормы", icon: Ruler },
  { to: "/org", uk: "Маржа", ru: "Маржа", icon: Wallet },
  { to: "/settings", uk: "Налаштування", ru: "Настройки", icon: Settings },
] as const;

function onPath(path: string, to: string) {
  if (to === "/") return path === "/";
  if (to === "/objects") return path.startsWith("/object");
  if (to === "/price") return path === "/price" || path.startsWith("/item");
  if (to === "/clients") return path.startsWith("/client");
  if (to === "/workers") return path.startsWith("/worker");
  return path === to;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data, setProfile } = useStore();
  const lang = data.profile.lang;
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [more, setMore] = useState(false);
  const light = data.profile.theme === "light";

  const brand = (
    <div>
      <p className="font-mono text-sm tracking-widest text-amber">Т-СИКС-Т</p>
      <p className="text-sm text-muted">{tr(lang, "Помічник", "Помощник")}</p>
    </div>
  );

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto grid min-h-dvh w-full max-w-6xl md:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="no-print sticky top-0 hidden h-dvh flex-col gap-4 overflow-y-auto border-r border-line px-3 py-5 md:flex">
          <div className="px-2">{brand}</div>
          <nav className="grid gap-1">
            {LINKS.map((item) => {
              const Icon = item.icon;
              const active = onPath(path, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    active
                      ? "flex min-h-11 items-center gap-3 rounded-xl bg-amber px-3 text-sm font-semibold text-ink"
                      : "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-fg"
                  }
                >
                  <Icon className="size-5 shrink-0" />
                  {tr(lang, item.uk, item.ru)}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="no-print flex items-center justify-between gap-3 px-4 pt-4 md:px-8">
            <div className="md:hidden">{brand}</div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="h-11 rounded-xl bg-raised px-3 text-sm font-semibold shadow-[var(--shadow)]"
                onClick={() => setProfile({ lang: lang === "uk" ? "ru" : "uk" })}
              >
                {lang === "uk" ? "RU" : "UA"}
              </button>
              <button
                type="button"
                aria-label={light ? "dark" : "light"}
                className="grid size-11 place-items-center rounded-xl bg-raised shadow-[var(--shadow)]"
                onClick={() => setProfile({ theme: light ? "dark" : "light" })}
              >
                {light ? <Moon className="size-5" /> : <Sun className="size-5" />}
              </button>
            </div>
          </header>
          <main className="px-4 pb-28 pt-4 md:px-8 md:pb-12">{children}</main>
        </div>
      </div>

      <nav className="dock no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {[LINKS[0], LINKS[3], LINKS[4]].map((item) => {
            const Icon = item.icon;
            const active = onPath(path, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMore(false)}
                className={active ? "grid min-h-14 place-items-center text-amber" : "grid min-h-14 place-items-center text-muted"}
              >
                <Icon className="size-6" />
                <span className="text-xs font-medium">{tr(lang, item.uk, item.ru)}</span>
              </Link>
            );
          })}
          <button
            type="button"
            className={more ? "grid min-h-14 place-items-center text-amber" : "grid min-h-14 place-items-center text-muted"}
            onClick={() => setMore((value) => !value)}
          >
            <Menu className="size-6" />
            <span className="text-xs font-medium">{tr(lang, "Ще", "Ещё")}</span>
          </button>
        </div>
      </nav>

      {more ? (
        <div className="no-print fixed inset-0 z-30 bg-bg/80 md:hidden" onClick={() => setMore(false)}>
          <div
            className="absolute inset-x-0 bottom-16 max-h-[70dvh] overflow-y-auto rounded-t-2xl border border-line bg-surface p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-1">
              {LINKS.filter((item) => item.to !== "/" && item.to !== "/price" && item.to !== "/objects").map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMore(false)}
                    className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base"
                  >
                    <Icon className="size-5 text-amber" />
                    {tr(lang, item.uk, item.ru)}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
