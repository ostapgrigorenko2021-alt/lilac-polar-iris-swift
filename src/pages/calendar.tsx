import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { tr } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";

export function CalendarPage() {
  const { data } = useStore();
  const lang = data.profile.lang;

  const stats = {
    workDays: 22,
    earned: "35 200",
    debt: "4 800",
  };

  return (
    <AppShell>
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white">
          <ArrowLeft size={16} />
          <span>{tr(lang, "Назад", "Назад")}</span>
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted uppercase tracking-wider">Жовтень / Октябрь 2026</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
            <p className="text-xs text-muted">{tr(lang, "Змін", "Смен")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-white tabular-nums">{stats.workDays}</p>
          </div>
          <div className="rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
            <p className="text-xs text-muted">{tr(lang, "Зароблено", "Заработано")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-amber tabular-nums">{stats.earned} ₴</p>
          </div>
          <div className="rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
            <p className="text-xs text-muted">{tr(lang, "Борг", "Долг")}</p>
            <p className="mt-1 font-mono text-xl font-bold text-red tabular-nums">{stats.debt} ₴</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <CalendarIcon className="size-5 text-amber" />
          {tr(lang, "Табель виходів", "Табель выходов")}
        </h2>
        
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-sm font-medium">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
            <div key={d} className="text-muted text-xs font-bold uppercase">{d}</div>
          ))}
          
          {Array.from({ length: 31 }).map((_, i) => {
            const day = i + 1;
            const isWork = day % 3 === 0;
            const isDebt = day === 15 || day === 21;

            return (
              <div key={day} className="relative py-2 flex flex-col items-center justify-center">
                <span className="text-base text-white">{day}</span>
                {isWork && <div className="mt-1 size-1.5 rounded-full bg-amber" />}
                {isDebt && <div className="mt-1 size-1.5 rounded-full bg-red" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <button className="flex h-14 w-full items-center justify-center rounded-2xl bg-amber text-lg font-semibold text-black shadow-lg transition-transform active:scale-[0.99]">
          {tr(lang, "+ ВІДМІТИТИ ВИХІД", "+ ОТМЕТИТЬ ВЫХОД")}
        </button>
      </div>
    </AppShell>
  );
}
