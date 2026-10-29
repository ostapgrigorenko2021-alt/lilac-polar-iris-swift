import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Card, CheckRow, Field, Money, NumField, Select, Stepper, TextInput } from "@/components/ui";
import { compute } from "@/lib/calc";
import { money, pct, tr, unitLabel } from "@/lib/format";
import { haulLabel } from "@/lib/labels";
import { Link, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Tier } from "@/lib/types";

export function CalcPage() {
  const { data, setDraft, setCoef, updateLine, removeLine, clearDraft, saveJob } = useStore();
  const lang = data.profile.lang;
  const draft = data.draft;
  const result = compute(draft);
  const navigate = useNavigate();
  const [tier, setTier] = useState<Tier>("work");
  const stop = ["bearing", "gas", "hazard", "collapse"].some((key) => draft.safety[key]);
  const coefOn = Object.values(draft.coef).some(Boolean);
  const chosen =
    tier === "min" ? result.min.price : tier === "rush" ? result.rush.price : tier === "list" ? result.listPrice : result.work.price;

  const tiers: { id: Tier; title: string; price: number; note: string }[] = [
    { id: "min", title: tr(lang, "Мінімальна", "Минимальная"), price: result.min.price, note: tr(lang, "Собівартість + 10%. Маржа 0.", "Себестоимость + 10%. Маржа 0.") },
    {
      id: "work",
      title: tr(lang, "Робоча", "Рабочая"),
      price: result.work.price,
      note: tr(lang, `Непередбачені ${draft.contingency}% + ваша маржа`, `Непредвиденные ${draft.contingency}% + ваша маржа`),
    },
    { id: "rush", title: tr(lang, "Термінова", "Срочная"), price: result.rush.price, note: tr(lang, "Вища ставка людей, 15% запас, маржа ×1.5", "Выше ставка людей, 15% запас, маржа ×1.5") },
  ];
  if (draft.lines.length) {
    tiers.push({
      id: "list",
      title: tr(lang, "Прайс Т-СИКС-Т", "Прайс Т-СИКС-Т"),
      price: result.listPrice,
      note: tr(lang, "Сума позицій × коефіцієнт об'єкта. Маржа вже в прайсі.", "Сумма позиций × коэффициент объекта. Маржа уже в прайсе."),
    });
  }

  const save = () => {
    const id = saveJob(tier);
    void navigate({ to: "/object/$id", params: { id } });
  };

  return (
    <AppShell>
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold">{tr(lang, "Ціна клієнту", "Цена клиенту")}</h1>
        <button type="button" className="min-h-11 text-sm text-muted" onClick={clearDraft}>
          {tr(lang, "Скинути", "Сбросить")}
        </button>
      </div>
      <p className="mt-1 text-sm text-muted">
        {tr(lang, "Роботи + інструмент + розхідники + транспорт + вивіз + запас + маржа", "Работы + инструмент + расходники + транспорт + вывоз + запас + маржа")}
      </p>
      {draft.address ? <p className="mt-2 text-sm">{draft.address}</p> : null}
      {stop ? (
        <p className="mt-3 rounded-xl bg-stop px-3 py-3 text-sm font-semibold text-onstop">
          {tr(lang, "На оцінці є стоп-фактор. Цю ціну не можна брати як дозвіл на роботу.", "На оценке есть стоп-фактор. Эту цену нельзя брать как разрешение на работу.")}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2">
        {tiers.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTier(item.id)}
            className={
              tier === item.id
                ? "rounded-2xl bg-amber px-4 py-4 text-left text-ink"
                : "rounded-2xl bg-surface px-4 py-4 text-left shadow-[var(--shadow)]"
            }
          >
            <span className="text-sm font-medium">{item.title}</span>
            <span className="mt-1 block font-mono text-4xl font-semibold tabular-nums">{money(item.price)}</span>
            <span className={tier === item.id ? "mt-1 block text-sm opacity-80" : "mt-1 block text-sm text-muted"}>{item.note}</span>
          </button>
        ))}
      </div>

      <Card className="mt-4">
        <p className="text-sm text-muted">{tr(lang, "Розклад робочої ціни", "Расклад рабочей цены")}</p>
        <Row label={tr(lang, "Роботи", "Работы")} value={money(result.work.labor)} />
        <Row label={tr(lang, "Інструмент", "Инструмент")} value={money(draft.tools)} />
        <Row label={tr(lang, "Розхідники", "Расходники")} value={money(draft.consumables)} />
        <Row label={tr(lang, "Транспорт", "Транспорт")} value={money(draft.transport)} />
        <Row label={tr(lang, "Вивіз", "Вывоз")} value={money(result.waste)} />
        <Row label={tr(lang, "Непередбачені", "Непредвиденные")} value={money(result.work.contingency)} />
        <Row label={tr(lang, "Маржа", "Маржа")} value={money(result.work.profit)} />
        <p className="mt-2 text-sm text-muted">
          {tr(lang, "Коефіцієнт робіт", "Коэффициент работ")} ×{result.mult.toFixed(2)} · {tr(lang, "маржа від чека", "маржа от чека")} {pct(result.work.marginPct)}
        </p>
        {draft.whoHauls !== "we" ? <p className="mt-1 text-sm text-muted">{haulLabel(lang, draft.whoHauls)}. {tr(lang, "Вивіз у ціну не входить.", "Вывоз в цену не входит.")}</p> : null}
      </Card>

      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <Btn variant={draft.basis === "crew" ? "primary" : "ghost"} onClick={() => setDraft({ basis: "crew" })}>
            {tr(lang, "Від бригади", "От бригады")}
          </Btn>
          <Btn variant={draft.basis === "lines" ? "primary" : "ghost"} onClick={() => setDraft({ basis: "lines" })} disabled={!draft.lines.length}>
            {tr(lang, "Від прайсу", "От прайса")}
          </Btn>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stepper label={tr(lang, "Людей", "Людей")} value={draft.people} min={0} onChange={(people) => setDraft({ people })} />
          <Stepper label={tr(lang, "Змін", "Смен")} value={draft.shifts} min={0} step={0.5} onChange={(shifts) => setDraft({ shifts })} />
        </div>
        <NumField label={tr(lang, "Ставка однієї людини", "Ставка одного человека")} value={draft.rate} suffix="грн" onChange={(rate) => setDraft({ rate })} />
        <div className="grid grid-cols-2 gap-2">
          <Btn variant={draft.rateUnit === "shift" ? "primary" : "ghost"} onClick={() => setDraft({ rateUnit: "shift" })}>
            {tr(lang, "Зміна", "Смена")}
          </Btn>
          <Btn variant={draft.rateUnit === "hour" ? "primary" : "ghost"} onClick={() => setDraft({ rateUnit: "hour" })}>
            {tr(lang, "Година", "Час")}
          </Btn>
        </div>
        {draft.rateUnit === "hour" ? (
          <Stepper label={tr(lang, "Годин у зміні", "Часов в смене")} value={draft.hours} min={1} onChange={(hours) => setDraft({ hours })} />
        ) : null}
        <p className="text-sm text-muted">
          {tr(lang, "Бригада без коефіцієнта:", "Бригада без коэффициента:")} <Money value={money(result.crewRaw)} />
          {draft.lines.length ? (
            <>
              {" · "}
              {tr(lang, "виконавцям за прайсом:", "исполнителям по прайсу:")} <Money value={money(result.lineRaw)} />
            </>
          ) : null}
        </p>
      </div>

      <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Коефіцієнти", "Коэффициенты")}</h2>
      <div className="mt-2 grid gap-2">
        <CheckRow checked={draft.coef.noLift} title={tr(lang, "Поверх без ліфта", "Этаж без лифта")} detail={tr(lang, "+8% за поверх, стеля +40%", "+8% за этаж, потолок +40%")} onChange={(noLift) => setCoef({ noLift })} />
        <CheckRow checked={draft.coef.height} title={tr(lang, "Висота", "Высота")} detail="+20%" onChange={(height) => setCoef({ height })} />
        <CheckRow checked={draft.coef.tight} title={tr(lang, "Тісний доступ", "Тесный доступ")} detail="+15%" onChange={(tight) => setCoef({ tight })} />
        <CheckRow checked={draft.coef.heavy} title={tr(lang, "Важкий бетон або метал", "Тяжёлый бетон или металл")} detail="+20%" onChange={(heavy) => setCoef({ heavy })} />
        <CheckRow checked={draft.coef.heat} title={tr(lang, "Спека", "Жара")} detail="+10%" onChange={(heat) => setCoef({ heat })} />
        <CheckRow checked={draft.coef.noUtils} title={tr(lang, "Немає води і світла", "Нет воды и света")} detail="+10%" onChange={(noUtils) => setCoef({ noUtils })} />
        <CheckRow checked={draft.coef.rush} title={tr(lang, "Вже закласти терміновість у робочу", "Уже заложить срочность в рабочую")} detail={tr(lang, "Термінова ціна тоді ще вища", "Срочная цена тогда ещё выше")} onChange={(rush) => setCoef({ rush })} />
      </div>
      {coefOn && draft.lines.length ? (
        <p className="mt-2 text-sm text-muted">
          {tr(lang, "Коефіцієнт множить усю оплату виконавця. Якщо позицію вже підняли в картці прайсу — не вмикайте те саме тут.", "Коэффициент умножает всю оплату исполнителя. Если позицию уже подняли в карточке прайса — не включайте то же самое здесь.")}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{tr(lang, "Позиції прайсу", "Позиции прайса")}</h2>
        <Link to="/price" search={{ pick: "1" }} className="inline-flex min-h-11 items-center font-semibold text-amber">
          {tr(lang, "Додати", "Добавить")}
        </Link>
      </div>
      <div className="mt-2 grid gap-2">
        {draft.lines.length === 0 ? <p className="text-sm text-muted">{tr(lang, "Позицій немає. Ціна йде від ставки бригади.", "Позиций нет. Цена идёт от ставки бригады.")}</p> : null}
        {draft.lines.map((line) => (
          <Card key={line.id} className="grid gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{lang === "ru" ? line.nameRu : line.nameUk}</p>
              <button type="button" className="grid size-11 shrink-0 place-items-center" onClick={() => removeLine(line.id)} aria-label="delete">
                <Trash2 className="size-5" />
              </button>
            </div>
            <NumField label={tr(lang, "Кількість", "Количество")} suffix={unitLabel(line.unit, lang)} value={line.qty} onChange={(qty) => updateLine(line.id, { qty })} />
            <p className="text-sm text-muted">
              {tr(lang, "Клієнту", "Клиенту")} {money(line.clientUnit)} · {tr(lang, "виконавцю", "исполнителю")} {money(line.workerUnit)} · {tr(lang, "сума", "сумма")} {money(line.qty * line.clientUnit)}
            </p>
          </Card>
        ))}
      </div>

      <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Інші витрати", "Прочие расходы")}</h2>
      <div className="mt-2 grid gap-3">
        <NumField label={tr(lang, "Інструмент, разом", "Инструмент, всего")} value={draft.tools} suffix="грн" onChange={(tools) => setDraft({ tools })} />
        <button type="button" className="text-left text-sm text-amber" onClick={() => setDraft({ tools: Math.round(80 * Math.max(1, draft.people) * Math.max(1, draft.shifts)) })}>
          {tr(lang, "Підставити 80 грн × люди × зміни", "Подставить 80 грн × люди × смены")}
        </button>
        <NumField label={tr(lang, "Розхідники", "Расходники")} value={draft.consumables} suffix="грн" onChange={(consumables) => setDraft({ consumables })} />
        <button type="button" className="text-left text-sm text-amber" onClick={() => setDraft({ consumables: Math.round(40 * Math.max(1, draft.people) * Math.max(1, draft.shifts)) })}>
          {tr(lang, "Підставити 40 грн × люди × зміни", "Подставить 40 грн × люди × смены")}
        </button>
        <NumField label={tr(lang, "Транспорт", "Транспорт")} value={draft.transport} suffix="грн" onChange={(transport) => setDraft({ transport })} />
        <button type="button" className="text-left text-sm text-amber" onClick={() => setDraft({ transport: 400 })}>
          {tr(lang, "Орієнтир по Києву: 400 грн", "Ориентир по Киеву: 400 грн")}
        </button>
        <NumField label={tr(lang, "Вивіз, грн за м³", "Вывоз, грн за м³")} value={draft.wasteRate} suffix="грн" onChange={(wasteRate) => setDraft({ wasteRate })} />
        <p className="text-sm text-muted">
          {draft.wasteM3} м³ · {haulLabel(lang, draft.whoHauls)}
        </p>
        <Field label={tr(lang, "Непередбачені, %", "Непредвиденные, %")}>
          <div className="grid grid-cols-3 gap-2">
            {[10, 12, 15].map((value) => (
              <Btn key={value} variant={draft.contingency === value ? "primary" : "ghost"} onClick={() => setDraft({ contingency: value })}>
                {value}%
              </Btn>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Btn variant={draft.profitMode === "percent" ? "primary" : "ghost"} onClick={() => setDraft({ profitMode: "percent" })}>
            %
          </Btn>
          <Btn variant={draft.profitMode === "fixed" ? "primary" : "ghost"} onClick={() => setDraft({ profitMode: "fixed" })}>
            {tr(lang, "Сума", "Сумма")}
          </Btn>
        </div>
        <NumField
          label={draft.profitMode === "percent" ? tr(lang, "Маржа, % від собівартості із запасом", "Маржа, % от себестоимости с запасом") : tr(lang, "Маржа, грн", "Маржа, грн")}
          value={draft.profitValue}
          suffix={draft.profitMode === "percent" ? "%" : "грн"}
          onChange={(profitValue) => setDraft({ profitValue })}
        />
      </div>

      <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Замовник", "Заказчик")}</h2>
      <div className="mt-2 grid gap-3">
        <Field label={tr(lang, "Ім'я", "Имя")}>
          <TextInput value={draft.clientName} onChange={(clientName) => setDraft({ clientName, clientId: "" })} />
        </Field>
        <Field label={tr(lang, "Телефон", "Телефон")}>
          <TextInput value={draft.clientPhone} inputMode="tel" onChange={(clientPhone) => setDraft({ clientPhone })} />
        </Field>
        {data.clients.length ? (
          <Field label={tr(lang, "Або з бази", "Или из базы")}>
            <Select
              value={draft.clientId}
              onChange={(clientId) => {
                const client = data.clients.find((item) => item.id === clientId);
                setDraft({ clientId, clientName: client?.name ?? "", clientPhone: client?.phone ?? draft.clientPhone });
              }}
              options={[{ value: "", label: "—" }, ...data.clients.map((client) => ({ value: client.id, label: client.name }))]}
            />
          </Field>
        ) : null}
      </div>

      <div className="sticky bottom-24 z-10 mt-4 md:bottom-4">
        <Btn className="w-full" onClick={save}>
          {tr(lang, "Зберегти об'єкт", "Сохранить объект")} · {money(chosen)}
        </Btn>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-2 flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </p>
  );
}
