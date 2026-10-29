import type { Lang } from "@/lib/types";

export function tr(lang: Lang, uk: string, ru: string) {
  return lang === "ru" ? ru : uk;
}

export function money(n: number) {
  const v = Number.isFinite(n) ? Math.round(n) : 0;
  return `${new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(v)} грн`;
}

export function num(v: unknown) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const x = Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(x) ? x : 0;
}

export function pct(n: number) {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n)}%`;
}

export function clock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return [h, m, r].map((part) => String(part).padStart(2, "0")).join(":");
}

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export const UNIT_LABEL: Record<string, [string, string]> = {
  m2: ["м²", "м²"],
  mp: ["м.п.", "м.п."],
  m3: ["м³", "м³"],
  pcs: ["шт.", "шт."],
  shift: ["зміна", "смена"],
  hour: ["год", "ч"],
  t: ["т", "т"],
  set: ["компл.", "компл."],
  point: ["точка", "точка"],
  km: ["км", "км"],
  day: ["доба", "сутки"],
  floor: ["поверх", "этаж"],
  kg: ["кг", "кг"],
};

export function unitLabel(unit: string, lang: Lang) {
  const pair = UNIT_LABEL[unit];
  if (!pair) return unit;
  return lang === "ru" ? pair[1] : pair[0];
}
