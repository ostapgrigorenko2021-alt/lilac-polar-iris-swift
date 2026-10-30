import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { money, pct, tr } from "@/lib/format";
import { dashboardStats } from "@/lib/stats";
import { Link } from "@tanstack/react-router";
import { BookOpen, Calculator, ClipboardList, Timer, Calendar } from "lucide-react";

export function HomePage() {
  const { data } = useStore();
  const lang = data.profile.lang;
  const stats = dashboardStats(data.objects);
  const stage =
    data.profile.stage === "worker"
      ? tr(lang, "Працюю руками", "Работаю руками")
      : data.profile.stage === "organizer"
        ? tr(lang, "Збираю бригаду", "Собираю бригаду")
        : tr(lang, "Підряд", "Подряд");

  const tiles = [
    { to: "/assess" as const, uk: "Оцінка об'єкта", ru: "Оценка объекта", icon: ClipboardList },
    { to: "/calc" as const, uk: "Калькулятор ціни", ru: "Калькулятор цены", icon: Calculator },
    { to: "/price" as const, uk: "Прайс Т-СИКС-Т", ru: "Прайс Т-СИКС-Т", icon: BookOpen },
    { to: "/site" as const, uk: "На об'єкті", ru: "На объекте", icon: Timer },
    { to: "/calendar" as const, uk: "Календар виходів", ru: "Календарь выходов", icon: Calendar },
  ];

  return (
    <AppShell>
      <p className="text-sm text-muted">
        {stage}
        {" · "}
        {money(data.profile.rate)}
        {data.profile.rateUnit === "hour" ? tr(lang, "/год", "/ч") : tr(lang, "/зміна", "/смена")}
      </p>
      <h1 className="mt-1 text-3xl font-semibold">{tr(lang, "Сьогодні на об'єкті", "Сегодня на объекте")}</h1>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label={tr(lang, "Прибуток", "Прибыль")} value={money(stats.profit)} />
        <Stat label={tr(lang, "Середній чек", "Средний чек")} value={money(stats.avg)} />
        <Stat label={tr(lang, "Середня маржа", "Средняя маржа")} value={pct(stats.avgMargin)} />
        <Stat label={tr(lang, "Об'єктів за місяць", "Объектов за месяц")} value={String(stats.monthCount)} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link key={tile.to} to={tile.to} className="flex min-h-20 items-center gap-3 rounded-2xl bg-surface px-4 shadow-[var(--shadow)]">
              <Icon className="size-6 text-amber" />
              <span className="text-lg font-semibold">{tr(lang, tile.uk, tile.ru)}</span>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-amber">{value}</p>
    </div>
  );
}
import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { money, pct, tr } from "@/lib/format";
import { dashboardStats } from "@/lib/stats";
import { Link } from "@tanstack/react-router";
import { BookOpen, Calculator, ClipboardList, Timer } from "lucide-react";

export function HomePage() {
  const { data } = useStore();
  const lang = data.profile.lang;
  const stats = dashboardStats(data.objects);
  const stage =
    data.profile.stage === "worker"
      ? tr(lang, "Працюю руками", "Работаю руками")
      : data.profile.stage === "organizer"
        ? tr(lang, "Збираю бригаду", "Собираю бригаду")
        : tr(lang, "Підряд", "Подряд");

  const tiles = [
    { to: "/assess" as const, uk: "Оцінка об'єкта", ru: "Оценка объекта", icon: ClipboardList },
    { to: "/calc" as const, uk: "Калькулятор ціни", ru: "Калькулятор цены", icon: Calculator },
    { to: "/price" as const, uk: "Прайс Т-СИКС-Т", ru: "Прайс Т-СИКС-Т", icon: BookOpen },
    { to: "/site" as const, uk: "На об'єкті", ru: "На объекте", icon: Timer },
  ];

  return (
    <AppShell>
      <p className="text-sm text-muted">
        {stage}
        {" · "}
        {money(data.profile.rate)}
        {data.profile.rateUnit === "hour" ? tr(lang, "/год", "/ч") : tr(lang, "/зміна", "/смена")}
      </p>
      <h1 className="mt-1 text-3xl font-semibold">{tr(lang, "Сьогодні на об'єкті", "Сегодня на объекте")}</h1>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label={tr(lang, "Прибуток", "Прибыль")} value={money(stats.profit)} />
        <Stat label={tr(lang, "Середній чек", "Средний чек")} value={money(stats.avg)} />
        <Stat label={tr(lang, "Середня маржа", "Средняя маржа")} value={pct(stats.avgMargin)} />
        <Stat label={tr(lang, "Об'єктів за місяць", "Объектов за месяц")} value={String(stats.monthCount)} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link key={tile.to} to={tile.to} className="flex min-h-20 items-center gap-3 rounded-2xl bg-surface px-4 shadow-[var(--shadow)]">
              <Icon className="size-6 text-amber" />
              <span className="text-lg font-semibold">{tr(lang, tile.uk, tile.ru)}</span>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-amber">{value}</p>
    </div>
  );
}
