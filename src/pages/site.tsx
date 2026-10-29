import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Area, Btn, Field, NumField, Select, TextInput } from "@/components/ui";
import { clock, tr, uid, unitLabel } from "@/lib/format";
import { useEffect, useState } from "react";

export function SitePage() {
  const { data, setSite, addLog } = useStore();
  const lang = data.profile.lang;
  const site = data.site;
  const [, setTick] = useState(0);
  const [voice, setVoice] = useState("");

  useEffect(() => {
    if (!site.running) return;
    const id = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [site.running]);

  const elapsed = site.baseElapsed + (site.running && site.startedAt ? (Date.now() - site.startedAt) / 1000 : 0);

  const listen = () => {
    const host = window as unknown as {
      SpeechRecognition?: new () => Rec;
      webkitSpeechRecognition?: new () => Rec;
    };
    const Ctor = host.SpeechRecognition || host.webkitSpeechRecognition;
    if (!Ctor) {
      setVoice(tr(lang, "Голос у цьому браузері недоступний. Пишіть текстом.", "Голос в этом браузере недоступен. Пишите текстом."));
      return;
    }
    const rec = new Ctor();
    rec.lang = lang === "ru" ? "ru-RU" : "uk-UA";
    rec.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      if (text) setSite({ note: site.note ? `${site.note} ${text}` : text });
    };
    try {
      rec.start();
    } catch {
      setVoice(tr(lang, "Мікрофон не відкрився.", "Микрофон не открылся."));
    }
  };

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">{tr(lang, "На об'єкті", "На объекте")}</h1>
      <p className="mt-3 text-center font-mono text-6xl font-semibold tabular-nums">{clock(elapsed)}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Btn
          onClick={() => {
            if (site.running) {
              const add = site.startedAt ? (Date.now() - site.startedAt) / 1000 : 0;
              setSite({ running: false, startedAt: null, baseElapsed: site.baseElapsed + add });
            } else {
              setSite({ running: true, startedAt: Date.now() });
            }
          }}
        >
          {site.running ? tr(lang, "Пауза", "Пауза") : tr(lang, "Старт", "Старт")}
        </Btn>
        <Btn
          variant="ghost"
          onClick={() => setSite({ running: false, startedAt: null, baseElapsed: 0 })}
        >
          {tr(lang, "Скинути час", "Сбросить время")}
        </Btn>
      </div>
      <div className="mt-4 grid gap-3">
        <Field label={tr(lang, "Об'єкт", "Объект")}>
          <Select
            value={site.objectId}
            onChange={(objectId) => setSite({ objectId })}
            options={[{ value: "", label: "—" }, ...data.objects.map((job) => ({ value: job.id, label: `${job.number} ${job.address}` }))]}
          />
        </Field>
        <NumField label={tr(lang, "Факт обсягу", "Факт объёма")} value={site.volume} onChange={(volume) => setSite({ volume })} />
        <Field label={tr(lang, "Одиниця", "Единица")}>
          <Select
            value={site.volumeUnit}
            onChange={(volumeUnit) => setSite({ volumeUnit })}
            options={["m2", "m3", "pcs", "mp"].map((unit) => ({ value: unit, label: unitLabel(unit, lang) }))}
          />
        </Field>
        <Field label={tr(lang, "Матеріал / інструмент", "Материал / инструмент")}>
          <TextInput value={site.materials} onChange={(materials) => setSite({ materials })} />
        </Field>
        <Field label={tr(lang, "Нотатка", "Заметка")}>
          <Area value={site.note} onChange={(note) => setSite({ note })} />
        </Field>
        <Btn variant="ghost" onClick={listen}>
          {tr(lang, "Голос у нотатку", "Голос в заметку")}
        </Btn>
        {voice ? <p className="text-sm text-muted">{voice}</p> : null}
        <Btn
          onClick={() => {
            const add = site.running && site.startedAt ? (Date.now() - site.startedAt) / 1000 : 0;
            addLog({
              id: uid("log"),
              objectId: site.objectId,
              at: new Date().toISOString(),
              elapsedSec: Math.round(site.baseElapsed + add),
              volume: site.volume,
              volumeUnit: site.volumeUnit,
              materials: site.materials,
              note: site.note,
            });
            setSite({ running: false, startedAt: null, baseElapsed: 0, volume: 0, materials: "", note: "" });
          }}
        >
          {tr(lang, "Записати в журнал", "Записать в журнал")}
        </Btn>
      </div>
      <div className="mt-4 grid gap-2">
        {data.logs.slice(0, 12).map((log) => (
          <p key={log.id} className="rounded-xl bg-surface px-3 py-3 text-sm shadow-[var(--shadow)]">
            {log.at.slice(0, 16).replace("T", " ")} · {clock(log.elapsedSec)} · {log.volume} {unitLabel(log.volumeUnit, lang)}
            {log.note ? ` · ${log.note}` : ""}
          </p>
        ))}
      </div>
    </AppShell>
  );
}

type Rec = {
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
};
