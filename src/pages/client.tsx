import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Area, Btn, CheckRow, Field, Select, TextInput } from "@/components/ui";
import { money, tr } from "@/lib/format";
import { clientTypeLabel } from "@/lib/labels";
import type { ClientType } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function ClientPage({ id }: { id: string }) {
  const { data, saveClient, deleteClient } = useStore();
  const lang = data.profile.lang;
  const client = data.clients.find((item) => item.id === id);
  const [armed, setArmed] = useState(false);
  if (!client) {
    return (
      <AppShell>
        <Link to="/clients" className="text-amber">
          {tr(lang, "До клієнтів", "К клиентам")}
        </Link>
      </AppShell>
    );
  }
  const jobs = data.objects.filter((job) => job.clientId === client.id || (job.clientName && job.clientName === client.name));
  return (
    <AppShell>
      <Link to="/clients" className="text-sm text-muted">
        {tr(lang, "До клієнтів", "К клиентам")}
      </Link>
      <div className="mt-3 grid gap-3">
        <Field label={tr(lang, "Ім'я", "Имя")}>
          <TextInput value={client.name} onChange={(name) => saveClient({ ...client, name })} />
        </Field>
        <Field label={tr(lang, "Телефон", "Телефон")}>
          <TextInput value={client.phone} inputMode="tel" onChange={(phone) => saveClient({ ...client, phone })} />
        </Field>
        <Field label={tr(lang, "Хто це", "Кто это")}>
          <Select
            value={client.type}
            onChange={(type) => saveClient({ ...client, type: type as ClientType })}
            options={(["private", "foreman", "company", "realtor"] as ClientType[]).map((item) => ({ value: item, label: clientTypeLabel(lang, item) }))}
          />
        </Field>
        <CheckRow checked={client.repeatOrders} title={tr(lang, "Дає повторні замовлення", "Даёт повторные заказы")} onChange={(repeatOrders) => saveClient({ ...client, repeatOrders })} />
        <Field label={tr(lang, "Нотатка", "Заметка")}>
          <Area value={client.notes} onChange={(notes) => saveClient({ ...client, notes })} />
        </Field>
      </div>
      <h2 className="mt-6 text-lg font-semibold">{tr(lang, "Об'єкти", "Объекты")}</h2>
      <div className="mt-2 grid gap-2">
        {jobs.length === 0 ? <p className="text-sm text-muted">{tr(lang, "Ще немає.", "Пока нет.")}</p> : null}
        {jobs.map((job) => (
          <Link key={job.id} to="/object/$id" params={{ id: job.id }} className="rounded-2xl bg-surface p-3 shadow-[var(--shadow)]">
            <p className="font-medium">{job.address}</p>
            <p className="font-mono text-amber">{money(job.clientPrice)}</p>
          </Link>
        ))}
      </div>
      <Btn className="mt-6" variant={armed ? "danger" : "ghost"} onClick={() => (armed ? deleteClient(client.id) : setArmed(true))}>
        {armed ? tr(lang, "Підтвердити", "Подтвердить") : tr(lang, "Видалити клієнта", "Удалить клиента")}
      </Btn>
    </AppShell>
  );
}
