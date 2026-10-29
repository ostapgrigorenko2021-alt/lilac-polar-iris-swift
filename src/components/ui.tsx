import { cn } from "@/lib/cn";
import { num } from "@/lib/format";
import type { ReactNode } from "react";

export function Btn({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "quiet";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors duration-150 disabled:opacity-40",
        variant === "primary" && "bg-amber text-ink",
        variant === "ghost" && "bg-raised text-fg shadow-[var(--shadow)]",
        variant === "danger" && "bg-stop text-onstop",
        variant === "quiet" && "bg-transparent text-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

const control = "h-12 w-full rounded-xl bg-raised px-3 text-base text-fg outline-none shadow-[var(--shadow)]";

export function TextInput({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "decimal" | "numeric";
}) {
  return (
    <input
      className={control}
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function Area({ value, onChange, rows = 3 }: { value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <textarea
      className="w-full rounded-xl bg-raised px-3 py-3 text-base text-fg outline-none shadow-[var(--shadow)]"
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select className={control} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function NumField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <Field label={label}>
      <span className={cn(control, "flex items-center gap-2")}>
        <input
          className="w-full bg-transparent tabular-nums outline-none"
          inputMode="decimal"
          value={value === 0 ? "" : String(value)}
          placeholder="0"
          onChange={(event) => onChange(num(event.target.value))}
        />
        {suffix ? <span className="shrink-0 text-sm text-muted">{suffix}</span> : null}
      </span>
    </Field>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
}) {
  const next = (dir: number) => {
    const raw = Math.round((value + dir * step) * 100) / 100;
    onChange(Math.max(min, raw));
  };
  return (
    <Field label={label}>
      <span className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] gap-2">
        <button type="button" className="h-12 rounded-xl bg-raised text-2xl text-fg shadow-[var(--shadow)]" onClick={() => next(-1)}>
          −
        </button>
        <input
          className={cn(control, "text-center font-mono text-lg tabular-nums")}
          inputMode="decimal"
          value={String(value)}
          onChange={(event) => onChange(Math.max(min, num(event.target.value)))}
        />
        <button type="button" className="h-12 rounded-xl bg-raised text-2xl text-fg shadow-[var(--shadow)]" onClick={() => next(1)}>
          +
        </button>
      </span>
    </Field>
  );
}

export function CheckRow({
  checked,
  onChange,
  title,
  detail,
  tone = "normal",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  detail?: string;
  tone?: "normal" | "stop" | "warn";
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex min-h-14 w-full items-center justify-between gap-3 rounded-xl px-3 text-left shadow-[var(--shadow)]",
        checked && tone === "stop" && "bg-stop text-onstop",
        checked && tone === "warn" && "bg-amber text-ink",
        checked && tone === "normal" && "bg-amber text-ink",
        !checked && "bg-raised text-fg",
      )}
    >
      <span className="min-w-0">
        <span className="block text-base font-medium">{title}</span>
        {detail ? <span className={cn("block text-sm", checked ? "opacity-80" : "text-muted")}>{detail}</span> : null}
      </span>
      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md border", checked ? "border-ink" : "border-line")}>
        {checked ? "✓" : ""}
      </span>
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl bg-surface p-4 shadow-[var(--shadow)]", className)}>{children}</section>;
}

export function Money({ value, className }: { value: string; className?: string }) {
  return <span className={cn("font-mono tabular-nums", className)}>{value}</span>;
}
