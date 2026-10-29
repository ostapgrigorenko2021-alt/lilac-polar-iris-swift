import { useStore } from "@/components/store";
import { Btn, CheckRow, NumField } from "@/components/ui";
import { peopleForStage, profitForStage } from "@/lib/defaults";
import { tr } from "@/lib/format";
import type { Lang, RateUnit, Stage } from "@/lib/types";
import { useState } from "react";

export function Onboarding() {
  const { data, finishOnboarding, setProfile } = useStore();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang>(data.profile.lang);
  const [rate, setRate] = useState(data.profile.rate || 1600);
  const [rateUnit, setRateUnit] = useState<RateUnit>(data.profile.rateUnit);
  const [stage, setStage] = useState<Stage>(data.profile.stage);

  const pickLang = (next: Lang) => {
    setLang(next);
    setProfile({ lang: next });
    setStep(1);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
      <p className="font-mono text-sm tracking-widest text-amber">Т-СИКС-Т</p>
      <h1 className="mt-2 text-3xl font-semibold">{tr(lang, "Помічник різноробочого", "Помощник разнорабочего")}</h1>
      <p className="mt-2 text-muted">
        {step === 0
          ? "Українська / русский"
          : tr(lang, "Три кроки. Далі — тільки цифри об'єкта.", "Три шага. Дальше — только цифры объекта.")}
      </p>

      {step === 0 ? (
        <div className="mt-8 grid gap-3">
          <Btn onClick={() => pickLang("uk")}>Українська</Btn>
          <Btn variant="ghost" onClick={() => pickLang("ru")}>
            Русский
          </Btn>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-8 grid gap-4">
          <NumField
            label={tr(lang, "Ваша ставка зараз", "Ваша ставка сейчас")}
            value={rate}
            onChange={setRate}
            suffix={tr(lang, "грн", "грн")}
          />
          <div className="grid grid-cols-2 gap-2">
            <Btn variant={rateUnit === "shift" ? "primary" : "ghost"} onClick={() => setRateUnit("shift")}>
              {tr(lang, "За зміну", "За смену")}
            </Btn>
            <Btn variant={rateUnit === "hour" ? "primary" : "ghost"} onClick={() => setRateUnit("hour")}>
              {tr(lang, "За годину", "За час")}
            </Btn>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="ghost" onClick={() => setStep(0)}>
              {tr(lang, "Назад", "Назад")}
            </Btn>
            <Btn disabled={rate <= 0} onClick={() => setStep(2)}>
              {tr(lang, "Далі", "Дальше")}
            </Btn>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-8 grid gap-3">
          {(
            [
              ["worker", tr(lang, "Працюю руками", "Работаю руками"), tr(lang, "У ціні буде видно, скільки лишається, якщо віддати роботу іншим.", "В цене будет видно, сколько остаётся, если отдать работу другим.")],
              ["organizer", tr(lang, "Збираю бригаду", "Собираю бригаду"), tr(lang, "Оплата виконавцю і ваша маржа рахуються окремо.", "Оплата исполнителю и ваша маржа считаются отдельно.")],
              ["contractor", tr(lang, "Вже беру об'єкти", "Уже беру объекты"), tr(lang, "Акцент на маржі, бригаді і повторних замовниках.", "Акцент на марже, бригаде и повторных заказчиках.")],
            ] as const
          ).map(([id, title, detail]) => (
            <CheckRow key={id} checked={stage === id} title={title} detail={detail} onChange={() => setStage(id)} />
          ))}
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="ghost" onClick={() => setStep(1)}>
              {tr(lang, "Назад", "Назад")}
            </Btn>
            <Btn
              onClick={() =>
                finishOnboarding({
                  onboarded: true,
                  lang,
                  theme: data.profile.theme,
                  stage,
                  rate,
                  rateUnit,
                  contingency: 12,
                  profitMode: "percent",
                  profitValue: profitForStage(stage),
                })
              }
            >
              {tr(lang, "Почати", "Начать")}
            </Btn>
          </div>
          <p className="text-sm text-muted">
            {tr(lang, "Людей у новому розрахунку: ", "Людей в новом расчёте: ")}
            {peopleForStage(stage)}. {tr(lang, "Маржа за замовчуванням: ", "Маржа по умолчанию: ")}
            {profitForStage(stage)}%.
          </p>
        </div>
      ) : null}
    </main>
  );
}
