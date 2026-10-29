import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Field, NumField, TextInput } from "@/components/ui";
import { money, tr } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function WorkerPage({ id }: { id: string }) {
  const { data, saveWorker, deleteWorker } = useStore();
  const lang = data.profile.lang;
  const worker = data.workers.find((item) => item.id === id);
  const [armed, setArmed] = useState(false);
  if (!worker) {
    return (
      <AppShell>
        <Link to="/workers" className="text-amber">
          {tr(lang, "До робітників", "К рабочим")}
        </Link>
      </AppShell>
    );
  }
  const jobs = data.objects.filter((job) => job.workerIds.includes(worker.id));
  const setScore = (key: "quality" | "speed" | "reliability", value: number) => saveWorker({ ...worker, [key]: value });
  return (
    <AppShell>
      <Link to="/workers" className="text-sm text-muted">
        {tr(lang, "До робітників", "К рабочим")}
      </Link>
      <div className="mt-3 grid gap-3">
        <Field label={tr(lang, "Ім'я", "Имя")}>
          <TextInput value={worker.name} onChange={(name) => saveWorker({ ...worker, name })} />
        </Field>
        <Field label={tr(lang, "Спеціалізація", "Специализация")}>
          <TextInput value={worker.specialty} onChange={(specialty) => saveWorker({ ...worker, specialty })} />
        </Field>
        <Field label={tr(lang, "Телефон", "Телефон")}>
          <TextInput value={worker.phone} inputMode="tel" onChange={(phone) => saveWorker({ ...worker, phone })} />
        </Field>
        <NumField label={tr(lang, "Ставка за зміну", "Ставка за смену")} value={worker.dayRate} suffix="грн" onChange={(dayRate) => saveWorker({ ...worker, dayRate })} />
        <Score label={tr(lang, "Якість", "Качество")} value={worker.quality} onChange={(value) => setScore("quality", value)} />
        <Score label={tr(lang, "Швидкість", "Скорость")} value={worker.speed} onChange={(value) => setScore("speed", value)} />
        <Score label={tr(lang, "Надійність", "Надёжность")} value={worker.reliability} onChange={(value) => setScore("reliability", value)} />
      </div>
      <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Об'єкти", "Объекты")}</h2>
      <div className="mt-2 grid gap-2">
        {jobs.length === 0 ? <p className="text-sm text-muted">{tr(lang, "Ще не виходив з вами.", "Ещё не выходил с вами.")}</p> : null}
        {jobs.map((job) => (
          <Link key={job.id} to="/object/$id" params={{ id: job.id }} className="rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
            <p>{job.address}</p>
            <p className="font-mono text-amber">{money(job.clientPrice)}</p>
          </Link>
        ))}
      </div>
      <Btn className="mt-6" variant={armed ? "danger" : "ghost"} onClick={() => (armed ? deleteWorker(worker.id) : setArmed(true))}>
        {armed ? tr(lang, "Підтвердити", "Подтвердить") : tr(lang, "Видалити", "Удалить")}
      </Btn>
    </AppShell>
  );
}

function Score({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <p className="mb-1 text-sm text-muted">{label}</p>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={score <= value ? "h-12 rounded-xl bg-amber font-semibold text-ink" : "h-12 rounded-xl bg-raised font-semibold"}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}
