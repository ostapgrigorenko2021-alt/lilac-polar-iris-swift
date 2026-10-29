import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Card, CheckRow, Field, NumField, Select, TextInput } from "@/components/ui";
import { emptyCoef, wasteFrom } from "@/lib/calc";
import { tr } from "@/lib/format";
import { OBJECT_TYPES, WORK_TYPES, haulLabel, objectTypeLabel, workTypeLabel } from "@/lib/labels";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const STOPS = [
  ["bearing", "Несучі конструкції", "Несущие конструкции", "Без проєкту не чіпати", "Без проекта не трогать"],
  ["gas", "Газ", "Газ", "Тільки допущена бригада", "Только допущенная бригада"],
  ["hazard", "Небезпечні матеріали", "Опасные материалы", "Азбест, хімія, невідомий пил", "Асбест, химия, неизвестная пыль"],
  ["collapse", "Ризик обвалу", "Риск обрушения", "Слабкі перекриття, тріщини, висячі маси", "Слабые перекрытия, трещины, висящие массы"],
] as const;

const WARNS = [
  ["electric", "Електрика під напругою", "Электрика под напряжением", "Щит і ввід — не імпровізація", "Щит и ввод — не импровизация"],
  ["height", "Висота", "Высота", "Край, дах, сходовий проліт", "Край, крыша, лестничный пролёт"],
] as const;

export function AssessPage() {
  const { data, setDraft } = useStore();
  const lang = data.profile.lang;
  const draft = data.draft;
  const navigate = useNavigate();
  const [touched, setTouched] = useState(false);
  const stop = STOPS.some(([key]) => draft.safety[key]);

  useEffect(() => {
    if (touched) return;
    const waste = wasteFrom(draft.workType, draft.area, draft.volume);
    if (waste.m3 !== draft.wasteM3 || waste.bags !== draft.wasteBags) {
      setDraft({ wasteM3: waste.m3, wasteBags: waste.bags });
    }
  }, [draft.workType, draft.area, draft.volume, draft.wasteM3, draft.wasteBags, touched, setDraft]);

  const setSafety = (key: string, value: boolean) => setDraft({ safety: { ...draft.safety, [key]: value }, safetyAck: false });

  const go = () => {
    const bags = draft.wasteM3 <= 0 ? 0 : Math.ceil(draft.wasteM3 / 0.05);
    setDraft({
      wasteBags: bags,
      coef: {
        ...emptyCoef(),
        noLift: !draft.hasElevator && draft.floor > 1,
        noUtils: !draft.hasWater && !draft.hasPower,
        heavy: draft.workType === "brick" || draft.workType === "screed",
        height: Boolean(draft.safety.height),
      },
    });
    void navigate({ to: "/calc" });
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">{tr(lang, "Оцінка об'єкта", "Оценка объекта")}</h1>
      <p className="mt-1 text-sm text-muted">{tr(lang, "Спочатку стоп-фактори. Потім об'єм.", "Сначала стоп-факторы. Потом объём.")}</p>

      <div className="mt-4 grid gap-2">
        {STOPS.map(([key, uk, ru, duk, dru]) => (
          <CheckRow key={key} tone="stop" checked={Boolean(draft.safety[key])} title={tr(lang, uk, ru)} detail={tr(lang, duk, dru)} onChange={(value) => setSafety(key, value)} />
        ))}
        {WARNS.map(([key, uk, ru, duk, dru]) => (
          <CheckRow key={key} tone="warn" checked={Boolean(draft.safety[key])} title={tr(lang, uk, ru)} detail={tr(lang, duk, dru)} onChange={(value) => setSafety(key, value)} />
        ))}
      </div>

      {stop ? (
        <Card className="mt-4 border border-stop">
          <p className="font-semibold text-stop">{tr(lang, "Стоп. Це не звичайний демонтаж.", "Стоп. Это не обычный демонтаж.")}</p>
          <p className="mt-1 text-sm text-muted">
            {tr(lang, "Ціна нижче не скасовує заборону. Потрібен фахівець, допуск або проєкт.", "Цена ниже не отменяет запрет. Нужен специалист, допуск или проект.")}
          </p>
          <div className="mt-3">
            <CheckRow
              tone="stop"
              checked={draft.safetyAck}
              title={tr(lang, "Розумію: сам це не виконую", "Понимаю: сам это не выполняю")}
              onChange={(value) => setDraft({ safetyAck: value })}
            />
          </div>
        </Card>
      ) : null}

      <div className="mt-4 grid gap-3">
        <Field label={tr(lang, "Адреса", "Адрес")}>
          <TextInput value={draft.address} onChange={(address) => setDraft({ address })} placeholder={tr(lang, "вулиця, будинок", "улица, дом")} />
        </Field>
        <Field label={tr(lang, "Тип об'єкта", "Тип объекта")}>
          <Select value={draft.objectType} onChange={(objectType) => setDraft({ objectType })} options={OBJECT_TYPES.map((id) => ({ value: id, label: objectTypeLabel(lang, id) }))} />
        </Field>
        <Field label={tr(lang, "Вид робіт", "Вид работ")}>
          <Select value={draft.workType} onChange={(workType) => setDraft({ workType })} options={WORK_TYPES.map((id) => ({ value: id, label: workTypeLabel(lang, id) }))} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <NumField label={tr(lang, "Площа", "Площадь")} value={draft.area} suffix="м²" onChange={(area) => setDraft({ area })} />
          <NumField label={tr(lang, "Об'єм конструкції", "Объём конструкции")} value={draft.volume} suffix="м³" onChange={(volume) => setDraft({ volume })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumField label={tr(lang, "Поверх", "Этаж")} value={draft.floor} onChange={(floor) => setDraft({ floor })} />
          <div className="self-end">
            <CheckRow checked={draft.hasElevator} title={tr(lang, "Є ліфт", "Есть лифт")} onChange={(hasElevator) => setDraft({ hasElevator })} />
          </div>
        </div>
        <Field label={tr(lang, "Шум", "Шум")}>
          <Select
            value={draft.noise}
            onChange={(noise) => setDraft({ noise })}
            options={[
              { value: "none", label: tr(lang, "Без обмежень", "Без ограничений") },
              { value: "quiet", label: tr(lang, "Тихі години", "Тихие часы") },
              { value: "weekend", label: tr(lang, "Вихідні не можна", "Выходные нельзя") },
            ]}
          />
        </Field>
        <Field label={tr(lang, "Час робіт", "Время работ")}>
          <Select
            value={draft.timeLimit}
            onChange={(timeLimit) => setDraft({ timeLimit })}
            options={[
              { value: "day", label: tr(lang, "День", "День") },
              { value: "evening", label: tr(lang, "Вечір", "Вечер") },
              { value: "night", label: tr(lang, "Ніч", "Ночь") },
            ]}
          />
        </Field>
      </div>

      <Card className="mt-4">
        <p className="text-sm text-muted">{tr(lang, "Сміття, орієнтир", "Мусор, ориентир")}</p>
        <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-amber">{draft.wasteM3} м³</p>
        <p className="text-sm text-muted">
          {tr(lang, "Мішків близько", "Мешков около")} {draft.wasteM3 <= 0 ? 0 : Math.ceil(draft.wasteM3 / 0.05)}
        </p>
        <div className="mt-3">
          <NumField
            label={tr(lang, "Скоригувати м³", "Скорректировать м³")}
            value={draft.wasteM3}
            suffix="м³"
            onChange={(wasteM3) => {
              setTouched(true);
              const wasteBags = wasteM3 <= 0 ? 0 : Math.ceil(wasteM3 / 0.05);
              setDraft({ wasteM3, wasteBags });
            }}
          />
        </div>
      </Card>

      <div className="mt-4 grid gap-2">
        <Field label={tr(lang, "Хто вивозить", "Кто вывозит")}>
          <Select
            value={draft.whoHauls}
            onChange={(value) => setDraft({ whoHauls: value as typeof draft.whoHauls })}
            options={[
              { value: "we", label: haulLabel(lang, "we") },
              { value: "client", label: haulLabel(lang, "client") },
              { value: "unknown", label: haulLabel(lang, "unknown") },
            ]}
          />
        </Field>
        <CheckRow checked={draft.hasWater} title={tr(lang, "Є вода", "Есть вода")} onChange={(hasWater) => setDraft({ hasWater })} />
        <CheckRow checked={draft.hasPower} title={tr(lang, "Є світло", "Есть свет")} onChange={(hasPower) => setDraft({ hasPower })} />
        <Field label={tr(lang, "Куди складати", "Куда складывать")}>
          <Select
            value={draft.storage}
            onChange={(storage) => setDraft({ storage })}
            options={[
              { value: "yard", label: tr(lang, "Двір", "Двор") },
              { value: "flat", label: tr(lang, "У квартирі", "В квартире") },
              { value: "box", label: tr(lang, "Контейнер", "Контейнер") },
              { value: "none", label: tr(lang, "Немає місця", "Нет места") },
            ]}
          />
        </Field>
      </div>

      <div className="sticky bottom-24 z-10 mt-4 md:bottom-4">
        <Btn className="w-full" disabled={stop && !draft.safetyAck} onClick={go}>
          {stop ? tr(lang, "Все одно рахувати ціну", "Всё равно считать цену") : tr(lang, "Розрахувати ціну", "Рассчитать цену")}
        </Btn>
      </div>
    </AppShell>
  );
}
