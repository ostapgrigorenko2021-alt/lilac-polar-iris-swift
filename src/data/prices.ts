import { CATALOG } from "@/data/catalog";
import { FACTORS, SECTION_FACTORS, SECTIONS } from "@/data/meta";
import type { AppData, CalcDraft, CatalogItem } from "@/lib/types";

export function sectionName(id: string, lang: "uk" | "ru") {
  const section = SECTIONS.find((item) => item.id === id);
  if (!section) return id;
  return lang === "ru" ? section.ru : section.uk;
}

export function resolveItems(data: Pick<AppData, "priceOverrides" | "customPrices">): CatalogItem[] {
  const base = CATALOG.map((item) => {
    const patch = data.priceOverrides[item.id];
    if (!patch) return item;
    return { ...item, ...patch, overridden: true as const };
  });
  return [...base, ...data.customPrices.map((item) => ({ ...item, custom: true as const }))];
}

export function findItem(data: Pick<AppData, "priceOverrides" | "customPrices">, id: string) {
  return resolveItems(data).find((item) => item.id === id);
}

export function factorsFor(item: CatalogItem) {
  const ids = SECTION_FACTORS[item.section] ?? ["rush", "access"];
  return ids.flatMap((id) => {
    const factor = FACTORS[id];
    return factor ? [factor] : [];
  });
}

export function suggestedQty(item: CatalogItem, draft: CalcDraft) {
  if (item.unit === "m2" && draft.area > 0) return draft.area;
  if (item.unit === "m3" && item.section === "trash" && draft.wasteM3 > 0) return draft.wasteM3;
  if (item.unit === "m3" && draft.volume > 0) return draft.volume;
  if (item.unit === "pcs" && item.id === "tr-bag" && draft.wasteBags > 0) return draft.wasteBags;
  if (item.unit === "shift") return Math.max(1, draft.shifts);
  return 1;
}

export function marginOf(price: number, worker: number) {
  const gap = price - worker;
  const percent = price > 0 ? (gap / price) * 100 : 0;
  return { gap, percent };
}
