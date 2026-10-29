import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Field, TextInput } from "@/components/ui";
import { fillScript, SCRIPTS } from "@/data/talks";
import { tr } from "@/lib/format";
import { useState } from "react";

export function TalkPage() {
  const { data } = useStore();
  const lang = data.profile.lang;
  const [who, setWho] = useState<"all" | "private" | "foreman">("all");
  const [fields, setFields] = useState({ address: "", work: "", price: "", advance: "", date: "", name: "" });
  const [copied, setCopied] = useState("");
  const list = SCRIPTS.filter((script) => who === "all" || script.who === "both" || script.who === who);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
    } catch {
      setCopied("");
    }
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">{tr(lang, "Переговори", "Переговоры")}</h1>
      <p className="mt-1 text-sm text-muted">{tr(lang, "Текст для копіювання. Підставте цифри зі свого розрахунку.", "Текст для копирования. Подставьте цифры из своего расчёта.")}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(
          [
            ["all", "Усі", "Все"],
            ["private", "Частник", "Частник"],
            ["foreman", "Прораб", "Прораб"],
          ] as const
        ).map(([id, uk, ru]) => (
          <Btn key={id} variant={who === id ? "primary" : "ghost"} onClick={() => setWho(id)}>
            {tr(lang, uk, ru)}
          </Btn>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Field label={tr(lang, "Адреса", "Адрес")}>
          <TextInput value={fields.address} onChange={(address) => setFields({ ...fields, address })} />
        </Field>
        <Field label={tr(lang, "Робота", "Работа")}>
          <TextInput value={fields.work} onChange={(work) => setFields({ ...fields, work })} />
        </Field>
        <Field label={tr(lang, "Ціна", "Цена")}>
          <TextInput value={fields.price} inputMode="decimal" onChange={(price) => setFields({ ...fields, price })} />
        </Field>
        <Field label={tr(lang, "Аванс", "Аванс")}>
          <TextInput value={fields.advance} inputMode="decimal" onChange={(advance) => setFields({ ...fields, advance })} />
        </Field>
        <Field label={tr(lang, "Дата", "Дата")}>
          <TextInput value={fields.date} onChange={(date) => setFields({ ...fields, date })} />
        </Field>
      </div>
      <div className="mt-4 grid gap-3">
        {list.map((script) => {
          const text = fillScript(lang === "ru" ? script.ru : script.uk, fields);
          return (
            <article key={script.id} className="rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
              <h2 className="text-lg font-semibold">{lang === "ru" ? script.ruTitle : script.ukTitle}</h2>
              <p className="mt-2 whitespace-pre-wrap text-base">{text}</p>
              <Btn className="mt-3" variant="ghost" onClick={() => void copy(script.id, text)}>
                {copied === script.id ? tr(lang, "Скопійовано", "Скопировано") : tr(lang, "Копіювати", "Копировать")}
              </Btn>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
