import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Field, NumField, Select } from "@/components/ui";
import { sumParts } from "@/lib/calc";
import { money, pct, tr } from "@/lib/format";
import { useState } from "react";

export function OrgPage() {
  const { data } = useStore();
  const lang = data.profile.lang;
  const [client, setClient] = useState(0);
  const [workers, setWorkers] = useState(0);
  const [visits, setVisits] = useState(1);
  const [visitCost, setVisitCost] = useState(data.profile.rateUnit === "hour" ? data.profile.rate * 2 : Math.round(data.profile.rate * 0.4));
  const [search, setSearch] = useState(0);
  const [logistics, setLogistics] = useState(0);
  const [other, setOther] = useState(0);
  const control = visits * visitCost;
  const cost = workers + control + search + logistics + other;
  const profit = client - cost;
  const margin = client > 0 ? (profit / client) * 100 : 0;

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">{tr(lang, "Маржа організатора", "Маржа организатора")}</h1>
      <p className="mt-1 text-sm text-muted">
        {tr(lang, "Клієнт мінус виконавці, пошук, контроль і логістика.", "Клиент минус исполнители, поиск, контроль и логистика.")}
      </p>
      <div className="mt-4 grid gap-3">
        <Field label={tr(lang, "Підставити з об'єкта", "Подставить из объекта")}>
          <Select
            value=""
            onChange={(id) => {
              const job = data.objects.find((item) => item.id === id);
              if (!job) return;
              setClient(job.clientPrice);
              setWorkers(job.planned.labor || sumParts(job.planned));
            }}
            options={[{ value: "", label: "—" }, ...data.objects.map((job) => ({ value: job.id, label: `${job.number} ${job.address}` }))]}
          />
        </Field>
        <NumField label={tr(lang, "Ціна клієнту", "Цена клиенту")} value={client} suffix="грн" onChange={setClient} />
        <NumField label={tr(lang, "Віддати робітникам", "Отдать рабочим")} value={workers} suffix="грн" onChange={setWorkers} />
        <NumField label={tr(lang, "Виїздів контролю", "Выездов контроля")} value={visits} onChange={setVisits} />
        <NumField label={tr(lang, "Вартість одного виїзду", "Стоимость одного выезда")} value={visitCost} suffix="грн" onChange={setVisitCost} />
        <NumField label={tr(lang, "Пошук людей", "Поиск людей")} value={search} suffix="грн" onChange={setSearch} />
        <NumField label={tr(lang, "Логістика", "Логистика")} value={logistics} suffix="грн" onChange={setLogistics} />
        <NumField label={tr(lang, "Інше", "Прочее")} value={other} suffix="грн" onChange={setOther} />
      </div>
      <section className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
        <p className="text-sm text-muted">{tr(lang, "Лишається вам", "Остаётся вам")}</p>
        <p className={profit < 0 ? "font-mono text-4xl font-semibold tabular-nums text-stop" : "font-mono text-4xl font-semibold tabular-nums text-amber"}>{money(profit)}</p>
        <p className="mt-1 text-sm text-muted">
          {pct(margin)} · {tr(lang, "витрати організатора", "расходы организатора")} {money(cost - workers)} · {tr(lang, "людям", "людям")} {money(workers)}
        </p>
      </section>
    </AppShell>
  );
}
