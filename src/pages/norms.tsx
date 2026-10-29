import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Field, NumField, TextInput } from "@/components/ui";
import { tr, uid, unitLabel, UNIT_LABEL } from "@/lib/format";
import { Select } from "@/components/ui";
import { useState } from "react";

export function NormsPage() {
  const { data, saveNorm, deleteNorm } = useStore();
  const lang = data.profile.lang;
  const [uk, setUk] = useState("");
  const [ru, setRu] = useState("");
  const [unit, setUnit] = useState("m2");
  const [output, setOutput] = useState(0);

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">{tr(lang, "Норми за зміну", "Нормы за смену")}</h1>
      <p className="mt-1 text-sm text-muted">{tr(lang, "Скільки один робітник закриває за зміну. Цифри можна змінити.", "Сколько один рабочий закрывает за смену. Цифры можно менять.")}</p>
      <div className="mt-4 grid gap-2">
        {data.norms.map((norm) => (
          <div key={norm.id} className="rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{lang === "ru" ? norm.ru : norm.uk}</p>
              <button type="button" className="min-h-11 text-sm text-muted" onClick={() => deleteNorm(norm.id)}>
                {tr(lang, "Прибрати", "Убрать")}
              </button>
            </div>
            <NumField
              label={tr(lang, "На 1 людину", "На 1 человека")}
              value={norm.output}
              suffix={unitLabel(norm.unit, lang)}
              onChange={(outputValue) => saveNorm({ ...norm, output: outputValue })}
            />
            <p className="mt-2 text-sm text-muted">{lang === "ru" ? norm.noteRu : norm.noteUk}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Своя норма", "Своя норма")}</h2>
      <div className="mt-2 grid gap-3">
        <Field label={tr(lang, "Назва", "Название")}>
          <TextInput value={lang === "ru" ? ru : uk} onChange={lang === "ru" ? setRu : setUk} />
        </Field>
        <Field label={tr(lang, "Одиниця", "Единица")}>
          <Select value={unit} onChange={setUnit} options={Object.keys(UNIT_LABEL).map((key) => ({ value: key, label: unitLabel(key, lang) }))} />
        </Field>
        <NumField label={tr(lang, "Виробіток", "Выработка")} value={output} onChange={setOutput} />
        <Btn
          disabled={!(uk.trim() || ru.trim()) || output <= 0}
          onClick={() => {
            const title = (lang === "ru" ? ru : uk).trim();
            saveNorm({
              id: uid("nm"),
              uk: uk.trim() || title,
              ru: ru.trim() || title,
              unit,
              output,
              noteUk: "",
              noteRu: "",
              custom: true,
            });
            setUk("");
            setRu("");
            setOutput(0);
          }}
        >
          {tr(lang, "Додати", "Добавить")}
        </Btn>
      </div>
    </AppShell>
  );
}
