import { NORM_SEED } from "@/data/norms";
import { marginOf, resolveItems, sectionName } from "@/data/prices";
import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Field, NumField } from "@/components/ui";
import { download, downloadExcel } from "@/lib/export";
import { money, tr, unitLabel } from "@/lib/format";
import { statusLabel } from "@/lib/labels";
import type { Stage } from "@/lib/types";
import { useState } from "react";

export function SettingsPage() {
  const store = useStore();
  const { data, setProfile, resetNorms, resetPrices, wipeJobs, wipeAll, replaceData } = store;
  const lang = data.profile.lang;
  const [note, setNote] = useState("");
  const [wipe, setWipe] = useState(0);

  const exportPrice = () => {
    const rows = [
      [tr(lang, "Розділ", "Раздел"), tr(lang, "Робота", "Работа"), tr(lang, "Од.", "Ед."), tr(lang, "Ринок від", "Рынок от"), tr(lang, "Ринок до", "Рынок до"), tr(lang, "Т-СИКС-Т", "Т-СИКС-Т"), tr(lang, "Виконавцю", "Исполнителю"), tr(lang, "Маржа", "Маржа"), tr(lang, "Входить", "Входит"), tr(lang, "Окремо", "Отдельно")],
      ...resolveItems(data).map((item) => {
        const margin = marginOf(item.price, item.worker);
        return [
          sectionName(item.section, lang),
          lang === "ru" ? item.ru : item.uk,
          unitLabel(item.unit, lang),
          String(item.marketMin),
          String(item.marketMax),
          String(item.price),
          String(item.worker),
          String(Math.round(margin.gap)),
          lang === "ru" ? item.inRu : item.inUk,
          lang === "ru" ? item.exRu : item.exUk,
        ];
      }),
    ];
    downloadExcel("tsikst-price.xls", rows);
  };

  const exportJobs = () => {
    const rows = [
      ["№", tr(lang, "Дата", "Дата"), tr(lang, "Статус", "Статус"), tr(lang, "Адреса", "Адрес"), tr(lang, "Клієнт", "Клиент"), tr(lang, "Ціна", "Цена"), tr(lang, "Аванс", "Аванс"), tr(lang, "План витрат", "План расходов"), tr(lang, "Факт витрат", "Факт расходов")],
      ...data.objects.map((job) => {
        const plan = job.planned.labor + job.planned.tools + job.planned.consumables + job.planned.transport + job.planned.waste + job.planned.other;
        const fact = job.actual.labor + job.actual.tools + job.actual.consumables + job.actual.transport + job.actual.waste + job.actual.other;
        return [job.number, job.createdAt.slice(0, 10), statusLabel(lang, job.status), job.address, job.clientName, String(job.clientPrice), String(job.advance), String(plan), String(fact)];
      }),
    ];
    downloadExcel("tsikst-objects.xls", rows);
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">{tr(lang, "Налаштування", "Настройки")}</h1>
      <div className="mt-4 grid gap-3">
        <Field label={tr(lang, "Етап", "Этап")}>
          <div className="grid gap-2">
            {(
              [
                ["worker", "Працюю руками", "Работаю руками"],
                ["organizer", "Збираю бригаду", "Собираю бригаду"],
                ["contractor", "Вже беру об'єкти", "Уже беру объекты"],
              ] as const
            ).map(([id, uk, ru]) => (
              <Btn key={id} variant={data.profile.stage === id ? "primary" : "ghost"} onClick={() => setProfile({ stage: id as Stage })}>
                {tr(lang, uk, ru)}
              </Btn>
            ))}
          </div>
        </Field>
        <NumField label={tr(lang, "Ставка за замовчуванням", "Ставка по умолчанию")} value={data.profile.rate} suffix="грн" onChange={(rate) => setProfile({ rate })} />
        <div className="grid grid-cols-2 gap-2">
          <Btn variant={data.profile.rateUnit === "shift" ? "primary" : "ghost"} onClick={() => setProfile({ rateUnit: "shift" })}>
            {tr(lang, "Зміна", "Смена")}
          </Btn>
          <Btn variant={data.profile.rateUnit === "hour" ? "primary" : "ghost"} onClick={() => setProfile({ rateUnit: "hour" })}>
            {tr(lang, "Година", "Час")}
          </Btn>
        </div>
        <NumField label={tr(lang, "Непередбачені за замовчуванням, %", "Непредвиденные по умолчанию, %")} value={data.profile.contingency} suffix="%" onChange={(contingency) => setProfile({ contingency })} />
        <div className="grid grid-cols-2 gap-2">
          <Btn variant={data.profile.profitMode === "percent" ? "primary" : "ghost"} onClick={() => setProfile({ profitMode: "percent" })}>
            %
          </Btn>
          <Btn variant={data.profile.profitMode === "fixed" ? "primary" : "ghost"} onClick={() => setProfile({ profitMode: "fixed" })}>
            {tr(lang, "Сума", "Сумма")}
          </Btn>
        </div>
        <NumField label={tr(lang, "Маржа за замовчуванням", "Маржа по умолчанию")} value={data.profile.profitValue} onChange={(profitValue) => setProfile({ profitValue })} />
      </div>

      <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Файл синхронізації", "Файл синхронизации")}</h2>
      <p className="mt-1 text-sm text-muted">
        {tr(lang, "Дані лежать на цьому телефоні. JSON можна покласти в Google Drive або «Обране» Telegram і відкрити на іншому пристрої. Реєстрація не потрібна.", "Данные лежат на этом телефоне. JSON можно положить в Google Drive или «Избранное» Telegram и открыть на другом устройстве. Регистрация не нужна.")}
      </p>
      <div className="mt-3 grid gap-2">
        <Btn
          variant="ghost"
          onClick={() => download(`tsikst-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data), "application/json")}
        >
          {tr(lang, "Зберегти JSON", "Сохранить JSON")}
        </Btn>
        <label className="flex h-12 items-center justify-center rounded-xl bg-raised font-semibold shadow-[var(--shadow)]">
          {tr(lang, "Відкрити JSON", "Открыть JSON")}
          <input
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void file.text().then((text) => {
                try {
                  const ok = replaceData(JSON.parse(text));
                  setNote(ok ? tr(lang, "Файл прочитано.", "Файл прочитан.") : tr(lang, "Це не файл Т-СИКС-Т.", "Это не файл Т-СИКС-Т."));
                } catch {
                  setNote(tr(lang, "Файл не читається.", "Файл не читается."));
                }
              });
            }}
          />
        </label>
        <Btn variant="ghost" onClick={exportJobs}>
          {tr(lang, "Об'єкти в Excel", "Объекты в Excel")}
        </Btn>
        <Btn variant="ghost" onClick={exportPrice}>
          {tr(lang, "Прайс в Excel", "Прайс в Excel")}
        </Btn>
        {note ? <p className="text-sm text-amber">{note}</p> : null}
      </div>

      <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Скидання", "Сброс")}</h2>
      <div className="mt-3 grid gap-2">
        <Btn variant="ghost" onClick={resetNorms}>
          {tr(lang, "Повернути норми", "Вернуть нормы")} ({NORM_SEED.length})
        </Btn>
        <Btn variant="ghost" onClick={resetPrices}>
          {tr(lang, "Прибрати мої ціни", "Убрать мои цены")}
        </Btn>
        <Btn variant="ghost" onClick={wipeJobs}>
          {tr(lang, "Стерти об'єкти, клієнтів, робітників", "Стереть объекты, клиентов, рабочих")}
        </Btn>
        <Btn
          variant={wipe === 1 ? "danger" : "ghost"}
          onClick={() => {
            if (wipe === 1) {
              wipeAll();
              setWipe(0);
            } else setWipe(1);
          }}
        >
          {wipe === 1 ? tr(lang, "Точно стерти все, включно зі ставкою", "Точно стереть всё, включая ставку") : tr(lang, "Стерти все", "Стереть всё")}
        </Btn>
      </div>
      <p className="mt-6 text-sm text-muted">
        {tr(lang, "Прайс зіставлений з ринком Києва 2026. Перед договором перевірте об'єм на місці. Ваша ставка зараз ", "Прайс сопоставлен с рынком Киева 2026. Перед договором проверьте объём на месте. Ваша ставка сейчас ")}
        {money(data.profile.rate)}.
      </p>
    </AppShell>
  );
}
