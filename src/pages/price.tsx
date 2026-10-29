import { SECTIONS } from "@/data/meta";
import { marginOf, resolveItems, sectionName, suggestedQty } from "@/data/prices";
import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Card, Field, NumField, Select, TextInput } from "@/components/ui";
import { money, pct, tr, uid, unitLabel, UNIT_LABEL } from "@/lib/format";
import type { CatalogItem } from "@/lib/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export function PricePage({ pick }: { pick: boolean }) {
  const { data, addLine } = useStore();
  const lang = data.profile.lang;
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [open, setOpen] = useState(false);
  const items = useMemo(() => resolveItems(data), [data]);
  const q = query.trim().toLowerCase();
  const shown = items.filter((item) => {
    if (section !== "all" && item.section !== section) return false;
    if (!q) return true;
    return `${item.uk} ${item.ru}`.toLowerCase().includes(q);
  });

  const add = (item: CatalogItem) => {
    addLine({
      id: uid("ln"),
      priceId: item.id,
      nameUk: item.uk,
      nameRu: item.ru,
      unit: item.unit,
      qty: suggestedQty(item, data.draft),
      clientUnit: item.price,
      workerUnit: item.worker,
    });
    void navigate({ to: "/calc" });
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">{tr(lang, "Прайс Т-СИКС-Т", "Прайс Т-СИКС-Т")}</h1>
      <p className="mt-1 text-sm text-muted">
        {tr(lang, "Київ і область, орієнтир 2026. Не оферта. Ціну Т-СИКС-Т можна замінити своєю.", "Киев и область, ориентир 2026. Не оферта. Цену Т-СИКС-Т можно заменить своей.")}
      </p>
      {pick ? <p className="mt-2 text-sm font-medium text-amber">{tr(lang, "Натисніть ціну — вона стане рядком калькулятора.", "Нажмите цену — она станет строкой калькулятора.")}</p> : null}

      <div className="mt-4 grid gap-2">
        <TextInput value={query} onChange={setQuery} placeholder={tr(lang, "Пошук роботи", "Поиск работы")} />
        <Select
          value={section}
          onChange={setSection}
          options={[{ value: "all", label: tr(lang, "Усі розділи", "Все разделы") }, ...SECTIONS.map((item) => ({ value: item.id, label: lang === "ru" ? item.ru : item.uk }))]}
        />
      </div>

      <div className="mt-3">
        <Btn variant="ghost" onClick={() => setOpen((value) => !value)}>
          {tr(lang, "Своя позиція", "Своя позиция")}
        </Btn>
      </div>
      {open ? <CustomForm /> : null}

      <p className="mt-4 text-sm text-muted">
        {shown.length} / {items.length}
      </p>
      <div className="mt-2 grid gap-2">
        {shown.map((item) => {
          const margin = marginOf(item.price, item.worker);
          return (
            <Card key={item.id}>
              <Link to="/item/$id" params={{ id: item.id }} className="block">
                <p className="text-sm text-muted">{sectionName(item.section, lang)}</p>
                <p className="mt-1 text-lg font-semibold">{lang === "ru" ? item.ru : item.uk}</p>
                <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-amber">
                  {money(item.price)}
                  <span className="ml-2 text-base font-medium text-muted">/ {unitLabel(item.unit, lang)}</span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  {tr(lang, "Ринок", "Рынок")} {money(item.marketMin)}–{money(item.marketMax)} · {tr(lang, "виконавцю", "исполнителю")} {money(item.worker)} · {tr(lang, "маржа", "маржа")} {money(margin.gap)} ({pct(margin.percent)})
                </p>
                {item.custom || item.overridden ? <p className="mt-1 text-sm text-amber">{tr(lang, "Моя ціна", "Моя цена")}</p> : null}
                {item.hazard === "stop" ? <p className="mt-1 text-sm font-semibold text-stop">{tr(lang, "Стоп-робота", "Стоп-работа")}</p> : null}
              </Link>
              <Btn className="mt-3 w-full" onClick={() => add(item)}>
                {tr(lang, "У калькулятор", "В калькулятор")}
              </Btn>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

function CustomForm() {
  const { data, saveCustomPrice } = useStore();
  const lang = data.profile.lang;
  const [uk, setUk] = useState("");
  const [ru, setRu] = useState("");
  const [section, setSection] = useState(SECTIONS[0].id);
  const [unit, setUnit] = useState("m2");
  const [marketMin, setMin] = useState(0);
  const [marketMax, setMax] = useState(0);
  const [price, setPrice] = useState(0);
  const [worker, setWorker] = useState(0);
  const [inUk, setInUk] = useState("");
  const [inRu, setInRu] = useState("");
  const [exUk, setExUk] = useState("");
  const [exRu, setExRu] = useState("");

  const save = () => {
    if (!uk.trim() && !ru.trim()) return;
    if (price < 0 || worker < 0 || worker > price) return;
    saveCustomPrice({
      id: uid("px"),
      section,
      uk: uk.trim() || ru.trim(),
      ru: ru.trim() || uk.trim(),
      unit,
      marketMin: marketMin || price,
      marketMax: marketMax || price,
      price,
      worker,
      inUk: inUk.trim() || "—",
      inRu: inRu.trim() || inUk.trim() || "—",
      exUk: exUk.trim() || "—",
      exRu: exRu.trim() || exUk.trim() || "—",
      hazard: "",
      custom: true,
    });
    setUk("");
    setRu("");
    setPrice(0);
    setWorker(0);
  };

  return (
    <Card className="mt-3 grid gap-3">
      <Field label={tr(lang, "Назва українською", "Название по-украински")}>
        <TextInput value={uk} onChange={setUk} />
      </Field>
      <Field label={tr(lang, "Назва російською", "Название по-русски")}>
        <TextInput value={ru} onChange={setRu} />
      </Field>
      <Field label={tr(lang, "Розділ", "Раздел")}>
        <Select value={section} onChange={setSection} options={SECTIONS.map((item) => ({ value: item.id, label: lang === "ru" ? item.ru : item.uk }))} />
      </Field>
      <Field label={tr(lang, "Одиниця", "Единица")}>
        <Select value={unit} onChange={setUnit} options={Object.keys(UNIT_LABEL).map((key) => ({ value: key, label: unitLabel(key, lang) }))} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <NumField label={tr(lang, "Ринок від", "Рынок от")} value={marketMin} onChange={setMin} />
        <NumField label={tr(lang, "Ринок до", "Рынок до")} value={marketMax} onChange={setMax} />
      </div>
      <NumField label={tr(lang, "Ціна Т-СИКС-Т", "Цена Т-СИКС-Т")} value={price} onChange={setPrice} />
      <NumField label={tr(lang, "Виконавцю", "Исполнителю")} value={worker} onChange={setWorker} />
      <Field label={tr(lang, "Що входить", "Что входит")}>
        <TextInput value={lang === "ru" ? inRu : inUk} onChange={lang === "ru" ? setInRu : setInUk} />
      </Field>
      <Field label={tr(lang, "Окремо", "Отдельно")}>
        <TextInput value={lang === "ru" ? exRu : exUk} onChange={lang === "ru" ? setExRu : setExUk} />
      </Field>
      <Btn onClick={save} disabled={price <= 0 || worker > price}>
        {tr(lang, "Додати в прайс", "Добавить в прайс")}
      </Btn>
    </Card>
  );
}
