import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { money, pct, tr } from "@/lib/format";
import { statusLabel } from "@/lib/labels";
import { dashboardStats, jobProfit, monthSeries } from "@/lib/stats";
import type { JobStatus } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";

export function ObjectsPage() {
  const { data } = useStore();
  const lang = data.profile.lang;
  const [status, setStatus] = useState<"all" | JobStatus>("all");
  const [query, setQuery] = useState("");
  const [Chart, setChart] = useState<ComponentType<{ rows: { label: string; plan: number; fact: number }[] }> | null>(null);
  const stats = dashboardStats(data.objects);
  const rows = monthSeries(data.objects, lang);
  const q = query.trim().toLowerCase();
  const list = data.objects.filter((job) => {
    if (status !== "all" && job.status !== status) return false;
    if (!q) return true;
    return `${job.address} ${job.clientName} ${job.number}`.toLowerCase().includes(q);
  });

  useEffect(() => {
    void import("@/components/profit-chart").then((mod) => setChart(() => mod.ProfitChart));
  }, []);

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">{tr(lang, "Об'єкти", "Объекты")}</h1>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Mini k={tr(lang, "Прибуток", "Прибыль")} v={money(stats.profit)} />
        <Mini k={tr(lang, "Середній чек", "Средний чек")} v={money(stats.avg)} />
        <Mini k={tr(lang, "Середня маржа", "Средняя маржа")} v={pct(stats.avgMargin)} />
        <Mini k={tr(lang, "За цей місяць", "За этот месяц")} v={String(stats.monthCount)} />
      </div>
      <section className="mt-4 rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
        <p className="text-sm text-muted">{tr(lang, "План — янтар. Факт зданих — зелений.", "План — янтарь. Факт сданных — зелёный.")}</p>
        {Chart ? <Chart rows={rows} /> : <div className="h-52" />}
      </section>
      <input
        className="mt-4 h-12 w-full rounded-xl bg-raised px-3 shadow-[var(--shadow)]"
        value={query}
        placeholder={tr(lang, "Адреса, замовник, номер", "Адрес, заказчик, номер")}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="mt-2 flex gap-2 overflow-x-auto">
        {(["all", "estimate", "active", "done", "lost"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatus(key)}
            className={status === key ? "h-11 shrink-0 rounded-xl bg-amber px-3 font-semibold text-ink" : "h-11 shrink-0 rounded-xl bg-raised px-3"}
          >
            {key === "all" ? tr(lang, "Усі", "Все") : statusLabel(lang, key)}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-2">
        {list.length === 0 ? <p className="text-sm text-muted">{tr(lang, "Об'єктів немає.", "Объектов нет.")}</p> : null}
        {list.map((job) => (
          <Link key={job.id} to="/object/$id" params={{ id: job.id }} className="block rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
            <p className="text-sm text-muted">
              {job.number} · {statusLabel(lang, job.status)}
              {job.safetyStop ? ` · ${tr(lang, "стоп", "стоп")}` : ""}
            </p>
            <p className="mt-1 text-lg font-semibold">{job.address}</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-amber">{money(job.clientPrice)}</p>
            <p className="text-sm text-muted">
              {job.clientName || "—"} · {tr(lang, "маржа", "маржа")} {money(jobProfit(job, job.status === "done"))}
            </p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
      <p className="text-sm text-muted">{k}</p>
      <p className="font-mono text-lg font-semibold tabular-nums">{v}</p>
    </div>
  );
}
