import { AppShell } from "@/components/shell";
import { useStore } from "@/components/store";
import { Btn, Field, Select, TextInput } from "@/components/ui";
import { tr, uid } from "@/lib/format";
import { clientTypeLabel } from "@/lib/labels";
import type { ClientType } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function ClientsPage() {
  const { data, saveClient } = useStore();
  const lang = data.profile.lang;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<ClientType>("private");

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">{tr(lang, "Клієнти", "Клиенты")}</h1>
      <div className="mt-4 grid gap-3">
        <Field label={tr(lang, "Ім'я", "Имя")}>
          <TextInput value={name} onChange={setName} />
        </Field>
        <Field label={tr(lang, "Телефон", "Телефон")}>
          <TextInput value={phone} inputMode="tel" onChange={setPhone} />
        </Field>
        <Field label={tr(lang, "Хто це", "Кто это")}>
          <Select
            value={type}
            onChange={(value) => setType(value as ClientType)}
            options={(["private", "foreman", "company", "realtor"] as ClientType[]).map((item) => ({ value: item, label: clientTypeLabel(lang, item) }))}
          />
        </Field>
        <Btn
          disabled={!name.trim()}
          onClick={() => {
            saveClient({ id: uid("cl"), name: name.trim(), phone: phone.trim(), type, notes: "", repeatOrders: false });
            setName("");
            setPhone("");
          }}
        >
          {tr(lang, "Додати", "Добавить")}
        </Btn>
      </div>
      <div className="mt-4 grid gap-2">
        {data.clients.length === 0 ? <p className="text-sm text-muted">{tr(lang, "Клієнтів немає.", "Клиентов нет.")}</p> : null}
        {data.clients.map((client) => {
          const count = data.objects.filter((job) => job.clientId === client.id || job.clientName === client.name).length;
          return (
            <Link key={client.id} to="/client/$id" params={{ id: client.id }} className="block rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
              <p className="text-lg font-semibold">{client.name}</p>
              <p className="text-sm text-muted">
                {clientTypeLabel(lang, client.type)}
                {client.repeatOrders ? ` · ${tr(lang, "дає повтори", "даёт повторы")}` : ""} · {count}
              </p>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
