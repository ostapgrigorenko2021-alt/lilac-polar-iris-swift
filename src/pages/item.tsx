import { factorsFor, findItem, marginOf, sectionName, suggestedQty } from "@/data/prices";
import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Card, CheckRow, Field, NumField, TextInput } from "@/components/ui";
import { money, pct, tr, uid, unitLabel } from "@/lib/format";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function ItemPage({ id }: { id: string }) {
  const store = useStore();
  const { data } = store;
  const lang = data.profile.lang;
  const item = findItem(data, id);
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string[]>([]);
  const [edit, setEdit] = useState(false);

  if (!item) {
    return (
      <AppShell>
        <p>{tr(lang, "Позиції немає.", "Позиции нет.")}</p>
        <Link to="/price" className="mt-3 inline-flex min-h-11 items-center text-amber">
          {tr(lang, "До прайсу", "К прайсу")}
        </Link>
      </AppShell>
    );
  }

  const factors = factorsFor(item);
  const coef = picked.reduce((acc, key) => acc * (factors.find((factor) => factor.id === key)?.coef ?? 1), 1);
  const price = Math.round(item.price * coef);
  const worker = Math.round(item.worker * coef);
  const margin = marginOf(price, worker);

  const add = () => {
    store.addLine({
      id: uid("ln"),
      priceId: item.id,
      nameUk: item.uk,
      nameRu: item.ru,
      unit: item.unit,
      qty: suggestedQty(item, data.draft),
      clientUnit: price,
      workerUnit: worker,
    });
    void navigate({ to: "/calc" });
  };

  return (
    <AppShell>
      <Link to="/price" className="no-print text-sm text-muted">
        {tr(lang, "До прайсу", "К прайсу")}
      </Link>
      <p className="mt-2 text-sm text-muted">{sectionName(item.section, lang)}</p>
      <h1 className="mt-1 text-3xl font-semibold">{lang === "ru" ? item.ru : item.uk}</h1>
      <p className="mt-3 font-mono text-5xl font-semibold tabular-nums text-amber">{money(price)}</p>
      <p className="text-muted">/ {unitLabel(item.unit, lang)}</p>
      {item.hazard === "stop" ? (
        <p className="mt-3 rounded-xl bg-stop px-3 py-3 text-sm font-semibold text-onstop">
          {tr(lang, "Стоп. Не рахувати як звичайну роботу без допуску або проєкту.", "Стоп. Не считать как обычную работу без допуска или проекта.")}
        </p>
      ) : null}
      {item.hazard === "warn" ? (
        <p className="mt-3 rounded-xl bg-amber px-3 py-3 text-sm font-semibold text-ink">
          {tr(lang, "Є висота або допуск. Закладіть це в коефіцієнт, не в знижку.", "Есть высота или допуск. Закладывайте это в коэффициент, не в скидку.")}
        </p>
      ) : null}

      <Card className="mt-4 grid gap-2 text-sm">
        <Line k={tr(lang, "Ринок Київ", "Рынок Киев")} v={`${money(item.marketMin)} – ${money(item.marketMax)}`} />
        <Line k={tr(lang, "Виконавцю", "Исполнителю")} v={money(worker)} />
        <Line k={tr(lang, "Маржа Т-СИКС-Т", "Маржа Т-СИКС-Т")} v={`${money(margin.gap)} · ${pct(margin.percent)}`} />
        <Line k={tr(lang, "Входить", "Входит")} v={lang === "ru" ? item.inRu : item.inUk} />
        <Line k={tr(lang, "Окремо", "Отдельно")} v={lang === "ru" ? item.exRu : item.exUk} />
      </Card>

      <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Коефіцієнти складності", "Коэффициенты сложности")}</h2>
      <p className="mt-1 text-sm text-muted">
        {tr(lang, "Множать і ціну клієнту, і оплату виконавцю. У калькуляторі об'єкта є свої коефіцієнти — не дублюйте.", "Умножают и цену клиенту, и оплату исполнителю. В калькуляторе объекта есть свои коэффициенты — не дублируйте.")}
      </p>
      <div className="mt-2 grid gap-2">
        {factors.map((factor) => (
          <CheckRow
            key={factor.id}
            checked={picked.includes(factor.id)}
            title={lang === "ru" ? factor.ru : factor.uk}
            detail={`×${factor.coef}`}
            onChange={(on) => setPicked((prev) => (on ? [...prev, factor.id] : prev.filter((key) => key !== factor.id)))}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        <Btn onClick={add}>{tr(lang, "У калькулятор", "В калькулятор")}</Btn>
        <Btn variant="ghost" onClick={() => setEdit((value) => !value)}>
          {tr(lang, "Змінити ціну", "Изменить цену")}
        </Btn>
      </div>
      {edit ? <Editor id={item.id} /> : null}
    </AppShell>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <p>
      <span className="text-muted">{k}. </span>
      <span>{v}</span>
    </p>
  );
}

function Editor({ id }: { id: string }) {
  const { data, setOverride, resetOverride, saveCustomPrice, deleteCustomPrice } = useStore();
  const lang = data.profile.lang;
  const item = findItem(data, id);
  const [marketMin, setMin] = useState(item?.marketMin ?? 0);
  const [marketMax, setMax] = useState(item?.marketMax ?? 0);
  const [price, setPrice] = useState(item?.price ?? 0);
  const [worker, setWorker] = useState(item?.worker ?? 0);
  const [inc, setInc] = useState(item ? (lang === "ru" ? item.inRu : item.inUk) : "");
  const [extra, setExtra] = useState(item ? (lang === "ru" ? item.exRu : item.exUk) : "");
  if (!item) return null;

  const save = () => {
    if (worker > price) return;
    if (item.custom) {
      saveCustomPrice({
        ...item,
        marketMin,
        marketMax,
        price,
        worker,
        inUk: lang === "uk" ? inc : item.inUk,
        inRu: lang === "ru" ? inc : item.inRu,
        exUk: lang === "uk" ? extra : item.exUk,
        exRu: lang === "ru" ? extra : item.exRu,
      });
      return;
    }
    setOverride(item.id, {
      marketMin,
      marketMax,
      price,
      worker,
      ...(lang === "ru" ? { inRu: inc, exRu: extra } : { inUk: inc, exUk: extra }),
    });
  };

  return (
    <Card className="mt-3 grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <NumField label={tr(lang, "Ринок від", "Рынок от")} value={marketMin} onChange={setMin} />
        <NumField label={tr(lang, "Ринок до", "Рынок до")} value={marketMax} onChange={setMax} />
      </div>
      <NumField label={tr(lang, "Ціна Т-СИКС-Т", "Цена Т-СИКС-Т")} value={price} onChange={setPrice} />
      <NumField label={tr(lang, "Виконавцю", "Исполнителю")} value={worker} onChange={setWorker} />
      <Field label={tr(lang, "Що входить", "Что входит")}>
        <TextInput value={inc} onChange={setInc} />
      </Field>
      <Field label={tr(lang, "Окремо", "Отдельно")}>
        <TextInput value={extra} onChange={setExtra} />
      </Field>
      <Btn onClick={save} disabled={worker > price}>
        {tr(lang, "Зберегти мою ціну", "Сохранить мою цену")}
      </Btn>
      {item.custom ? (
        <Btn variant="danger" onClick={() => deleteCustomPrice(item.id)}>
          {tr(lang, "Видалити позицію", "Удалить позицию")}
        </Btn>
      ) : (
        <Btn variant="ghost" onClick={() => resetOverride(item.id)}>
          {tr(lang, "Повернути прайс Т-СИКС-Т", "Вернуть прайс Т-СИКС-Т")}
        </Btn>
      )}
    </Card>
  );
}
