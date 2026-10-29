import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Area, Btn, Card, Field, NumField, Select, TextInput } from "@/components/ui";
import { sumParts } from "@/lib/calc";
import { money, pct, tr, unitLabel } from "@/lib/format";
import { OBJECT_TYPES, clientTypeLabel, objectTypeLabel, repeatLabel, statusLabel, workTypeLabel } from "@/lib/labels";
import { compressImage } from "@/lib/photos";
import type { CostParts, Job, JobStatus, RepeatFlag } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function ObjectPage({ id }: { id: string }) {
  const { data, updateJob, deleteJob } = useStore();
  const lang = data.profile.lang;
  const job = data.objects.find((item) => item.id === id);
  const [armed, setArmed] = useState(false);
  if (!job) {
    return (
      <AppShell>
        <p>{tr(lang, "Об'єкта немає.", "Объекта нет.")}</p>
        <Link to="/objects" className="mt-3 inline-flex min-h-11 items-center text-amber">
          {tr(lang, "До списку", "К списку")}
        </Link>
      </AppShell>
    );
  }

  const planCost = sumParts(job.planned);
  const factCost = sumParts(job.actual);
  const planProfit = job.clientPrice - planCost;
  const factProfit = job.clientPrice - factCost;
  const denom = job.people * job.shifts;
  const prod = denom > 0 && job.area > 0 ? job.area / denom : 0;
  const logs = data.logs.filter((log) => log.objectId === job.id);
  const patch = (part: Partial<Job>) => updateJob(job.id, part);
  const setCost = (key: "planned" | "actual", field: keyof CostParts, value: number) =>
    patch({ [key]: { ...job[key], [field]: value } });

  const addPhoto = async (file: File | undefined, key: "photosBefore" | "photosAfter") => {
    if (!file || job[key].length >= 4) return;
    try {
      const url = await compressImage(file);
      patch({ [key]: [...job[key], url] });
    } catch {
      /* skip broken file */
    }
  };

  return (
    <AppShell>
      <div className="print-root">
        <p className="font-mono text-sm tracking-widest text-amber">Т-СИКС-Т</p>
        <p className="mt-2 text-sm text-muted">
          {job.number} · {job.createdAt.slice(0, 10)} · {statusLabel(lang, job.status)}
        </p>
        <h1 className="mt-1 text-3xl font-semibold">{job.address}</h1>
        {job.safetyStop ? (
          <p className="mt-3 rounded-xl bg-stop px-3 py-3 text-sm font-semibold text-onstop">
            {tr(lang, "Стоп-фактор з оцінки. Не виконувати цю частину без допуску.", "Стоп-фактор с оценки. Не выполнять эту часть без допуска.")}
          </p>
        ) : null}
        <p className="mt-4 font-mono text-5xl font-semibold tabular-nums text-amber">{money(job.clientPrice)}</p>
        <p className="text-sm text-muted">
          {tr(lang, "Аванс", "Аванс")} {money(job.advance)} · {tr(lang, "план", "план")} {money(planProfit)} · {tr(lang, "факт", "факт")} {money(factProfit)}
        </p>
        <p className="mt-1 text-sm text-muted">
          {tr(lang, "Маржа факту", "Маржа факта")} {job.clientPrice > 0 ? pct((factProfit / job.clientPrice) * 100) : "0%"} ·{" "}
          {prod ? `${prod.toFixed(1)} м²/${tr(lang, "люд", "чел")}/${tr(lang, "зміна", "смена")}` : tr(lang, "Немає площі або зміни", "Нет площади или смены")}
        </p>

        <div className="no-print mt-4 grid grid-cols-2 gap-2">
          {(["estimate", "active", "done", "lost"] as JobStatus[]).map((status) => (
            <Btn key={status} variant={job.status === status ? "primary" : "ghost"} onClick={() => patch({ status })}>
              {statusLabel(lang, status)}
            </Btn>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          <Field label={tr(lang, "Адреса", "Адрес")}>
            <TextInput value={job.address} onChange={(address) => patch({ address })} />
          </Field>
          <Field label={tr(lang, "Замовник", "Заказчик")}>
            <TextInput value={job.clientName} onChange={(clientName) => patch({ clientName })} />
          </Field>
          <Field label={tr(lang, "Телефон", "Телефон")}>
            <TextInput value={job.clientPhone} inputMode="tel" onChange={(clientPhone) => patch({ clientPhone })} />
          </Field>
          {data.clients.length ? (
            <Field label={tr(lang, "Картка клієнта", "Карточка клиента")}>
              <Select
                value={job.clientId}
                onChange={(clientId) => {
                  const client = data.clients.find((item) => item.id === clientId);
                  patch({ clientId, clientName: client?.name ?? job.clientName, clientPhone: client?.phone ?? job.clientPhone });
                }}
                options={[{ value: "", label: "—" }, ...data.clients.map((client) => ({ value: client.id, label: `${client.name} · ${clientTypeLabel(lang, client.type)}` }))]}
              />
            </Field>
          ) : null}
          <Field label={tr(lang, "Тип", "Тип")}>
            <Select value={job.objectType} onChange={(objectType) => patch({ objectType })} options={OBJECT_TYPES.map((item) => ({ value: item, label: objectTypeLabel(lang, item) }))} />
          </Field>
          <p className="text-sm text-muted">
            {workTypeLabel(lang, job.workType)} · {job.area} м² · {job.volume} м³ · {tr(lang, "поверх", "этаж")} {job.floor}
            {job.hasElevator ? "" : tr(lang, ", без ліфта", ", без лифта")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <NumField label={tr(lang, "Людей", "Людей")} value={job.people} onChange={(people) => patch({ people })} />
            <NumField label={tr(lang, "Змін", "Смен")} value={job.shifts} onChange={(shifts) => patch({ shifts })} />
          </div>
          <Field label={tr(lang, "Строк", "Срок")}>
            <input className="h-12 w-full rounded-xl bg-raised px-3 shadow-[var(--shadow)]" type="date" value={job.deadline} onChange={(event) => patch({ deadline: event.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <NumField label={tr(lang, "Ціна клієнту", "Цена клиенту")} value={job.clientPrice} onChange={(clientPrice) => patch({ clientPrice })} />
            <NumField label={tr(lang, "Аванс", "Аванс")} value={job.advance} onChange={(advance) => patch({ advance })} />
          </div>
        </div>

        <h2 className="mt-6 text-lg font-semibold">{tr(lang, "План витрат", "План расходов")}</h2>
        <Costs lang={lang} value={job.planned} onChange={(field, value) => setCost("planned", field, value)} />
        <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Факт витрат", "Факт расходов")}</h2>
        <Costs lang={lang} value={job.actual} onChange={(field, value) => setCost("actual", field, value)} />

        {job.lines.length ? (
          <Card className="mt-4">
            <p className="text-sm text-muted">{tr(lang, "Позиції розрахунку", "Позиции расчёта")}</p>
            {job.lines.map((line) => (
              <p key={line.id} className="mt-2 text-sm">
                {lang === "ru" ? line.nameRu : line.nameUk}: {line.qty} {unitLabel(line.unit, lang)} · {money(line.qty * line.clientUnit)}
              </p>
            ))}
          </Card>
        ) : null}

        <div className="mt-4 grid gap-3">
          <Field label={tr(lang, "Проблеми", "Проблемы")}>
            <Area value={job.problems} onChange={(problems) => patch({ problems })} />
          </Field>
          <Field label={tr(lang, "Що з'ясував по грошах", "Что выяснил по деньгам")}>
            <Area value={job.learned} onChange={(learned) => patch({ learned })} />
          </Field>
          <Field label={tr(lang, "Що змінити в наступній ціні", "Что изменить в следующей цене")}>
            <Area value={job.improve} onChange={(improve) => patch({ improve })} />
          </Field>
        </div>
        <div className="mt-3 grid gap-2">
          {(["none", "maybe", "yes"] as RepeatFlag[]).map((value) => (
            <Btn key={value} variant={job.repeat === value ? "primary" : "ghost"} onClick={() => patch({ repeat: value })}>
              {repeatLabel(lang, value)}
            </Btn>
          ))}
        </div>

        <h2 className="no-print mt-6 text-lg font-semibold">{tr(lang, "Фото до", "Фото до")}</h2>
        <Photos files={job.photosBefore} onAdd={(file) => void addPhoto(file, "photosBefore")} onRemove={(index) => patch({ photosBefore: job.photosBefore.filter((_, i) => i !== index) })} />
        <h2 className="no-print mt-4 text-lg font-semibold">{tr(lang, "Фото після", "Фото после")}</h2>
        <Photos files={job.photosAfter} onAdd={(file) => void addPhoto(file, "photosAfter")} onRemove={(index) => patch({ photosAfter: job.photosAfter.filter((_, i) => i !== index) })} />

        {logs.length ? (
          <Card className="mt-4">
            <p className="text-sm text-muted">{tr(lang, "Журнал на об'єкті", "Журнал на объекте")}</p>
            {logs.map((log) => (
              <p key={log.id} className="mt-2 text-sm">
                {log.at.slice(0, 16).replace("T", " ")} · {log.volume} {unitLabel(log.volumeUnit, lang)} · {log.note}
              </p>
            ))}
          </Card>
        ) : null}

        <div className="no-print mt-6 grid gap-2">
          <Btn variant="ghost" onClick={() => window.print()}>
            {tr(lang, "Друк / PDF", "Печать / PDF")}
          </Btn>
          <Btn variant={armed ? "danger" : "ghost"} onClick={() => (armed ? deleteJob(job.id) : setArmed(true))}>
            {armed ? tr(lang, "Підтвердити видалення", "Подтвердить удаление") : tr(lang, "Видалити об'єкт", "Удалить объект")}
          </Btn>
        </div>
      </div>
    </AppShell>
  );
}

function Costs({ lang, value, onChange }: { lang: "uk" | "ru"; value: CostParts; onChange: (field: keyof CostParts, value: number) => void }) {
  const fields: { key: keyof CostParts; uk: string; ru: string }[] = [
    { key: "labor", uk: "Роботи", ru: "Работы" },
    { key: "tools", uk: "Інструмент", ru: "Инструмент" },
    { key: "consumables", uk: "Розхідники", ru: "Расходники" },
    { key: "transport", uk: "Транспорт", ru: "Транспорт" },
    { key: "waste", uk: "Вивіз", ru: "Вывоз" },
    { key: "other", uk: "Інше", ru: "Прочее" },
  ];
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {fields.map((field) => (
        <NumField key={field.key} label={tr(lang, field.uk, field.ru)} value={value[field.key]} suffix="грн" onChange={(next) => onChange(field.key, next)} />
      ))}
    </div>
  );
}

function Photos({ files, onAdd, onRemove }: { files: string[]; onAdd: (file: File | undefined) => void; onRemove: (index: number) => void }) {
  return (
    <div className="no-print mt-2">
      <div className="grid grid-cols-3 gap-2">
        {files.map((src, index) => (
          <button key={src.slice(0, 32) + index} type="button" onClick={() => onRemove(index)} className="overflow-hidden rounded-xl">
            <img src={src} alt="" className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>
      {files.length < 4 ? (
        <label className="mt-2 flex h-12 items-center justify-center rounded-xl bg-raised text-sm font-semibold shadow-[var(--shadow)]">
          +
          <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => onAdd(event.target.files?.[0])} />
        </label>
      ) : null}
    </div>
  );
}
