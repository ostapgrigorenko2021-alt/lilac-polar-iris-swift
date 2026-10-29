import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Field, NumField, TextInput } from "@/components/ui";
import { money, tr, uid } from "@/lib/format";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function WorkersPage() {
  const { data, saveWorker, setDraft } = useStore();
  const lang = data.profile.lang;
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [dayRate, setDayRate] = useState(0);
  const [pick, setPick] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const selected = data.workers.filter((worker) => ids.includes(worker.id));
  const sum = selected.reduce((acc, worker) => acc + worker.dayRate, 0);

  return (
    <AppShell>
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold">{tr(lang, "Робітники", "Рабочие")}</h1>
        <Btn variant={pick ? "primary" : "ghost"} onClick={() => setPick((value) => !value)}>
          {tr(lang, "Бригада", "Бригада")}
        </Btn>
      </div>
      <div className="mt-4 grid gap-3">
        <Field label={tr(lang, "Ім'я", "Имя")}>
          <TextInput value={name} onChange={setName} />
        </Field>
        <Field label={tr(lang, "Спеціалізація", "Специализация")}>
          <TextInput value={specialty} onChange={setSpecialty} placeholder={tr(lang, "демонтаж, підсобник", "демонтаж, подсобник")} />
        </Field>
        <Field label={tr(lang, "Телефон", "Телефон")}>
          <TextInput value={phone} inputMode="tel" onChange={setPhone} />
        </Field>
        <NumField label={tr(lang, "Ставка за зміну", "Ставка за смену")} value={dayRate} suffix="грн" onChange={setDayRate} />
        <Btn
          disabled={!name.trim()}
          onClick={() => {
            saveWorker({
              id: uid("wk"),
              name: name.trim(),
              phone: phone.trim(),
              specialty: specialty.trim(),
              dayRate,
              quality: 3,
              speed: 3,
              reliability: 3,
            });
            setName("");
            setPhone("");
            setSpecialty("");
            setDayRate(0);
          }}
        >
          {tr(lang, "Додати", "Добавить")}
        </Btn>
      </div>
      <div className="mt-4 grid gap-2">
        {data.workers.map((worker) => {
          const on = ids.includes(worker.id);
          const body = (
            <>
              <p className="text-lg font-semibold">{worker.name}</p>
              <p className="text-sm text-muted">
                {worker.specialty || "—"} · {money(worker.dayRate)}
                {tr(lang, "/зміна", "/смена")}
              </p>
            </>
          );
          if (!pick) {
            return (
              <Link key={worker.id} to="/worker/$id" params={{ id: worker.id }} className="block rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
                {body}
              </Link>
            );
          }
          return (
            <button
              key={worker.id}
              type="button"
              onClick={() => setIds((prev) => (on ? prev.filter((item) => item !== worker.id) : [...prev, worker.id]))}
              className={on ? "rounded-2xl bg-amber p-4 text-left text-ink" : "rounded-2xl bg-surface p-4 text-left shadow-[var(--shadow)]"}
            >
              {body}
            </button>
          );
        })}
      </div>
      {pick ? (
        <div className="sticky bottom-24 mt-4 md:bottom-4">
          <Btn
            className="w-full"
            disabled={!selected.length}
            onClick={() => {
              const avg = Math.round(sum / selected.length);
              setDraft({
                people: selected.length,
                shifts: Math.max(1, data.draft.shifts),
                rate: avg,
                rateUnit: "shift",
                basis: "crew",
                workerIds: selected.map((worker) => worker.id),
              });
              void navigate({ to: "/calc" });
            }}
          >
            {tr(lang, "У калькулятор", "В калькулятор")} · {selected.length} · {money(sum)}
          </Btn>
        </div>
      ) : null}
    </AppShell>
  );
}
