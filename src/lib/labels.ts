import type { ClientType, Haul, JobStatus, Lang, RepeatFlag } from "@/lib/types";
import { tr } from "@/lib/format";

export const OBJECT_TYPES = ["flat", "house", "office", "garage", "plot", "other"] as const;
export const WORK_TYPES = ["tile", "screed", "gkl", "brick", "plaster", "trash", "mixed", "other"] as const;

export function objectTypeLabel(lang: Lang, id: string) {
  const map: Record<string, [string, string]> = {
    flat: ["Квартира", "Квартира"],
    house: ["Будинок", "Дом"],
    office: ["Офіс", "Офис"],
    garage: ["Гараж", "Гараж"],
    plot: ["Ділянка", "Участок"],
    other: ["Інше", "Другое"],
  };
  const pair = map[id] ?? map.other;
  return tr(lang, pair[0], pair[1]);
}

export function workTypeLabel(lang: Lang, id: string) {
  const map: Record<string, [string, string]> = {
    tile: ["Плитка", "Плитка"],
    screed: ["Стяжка", "Стяжка"],
    gkl: ["ГКЛ", "ГКЛ"],
    brick: ["Цегла / блок", "Кирпич / блок"],
    plaster: ["Штукатурка", "Штукатурка"],
    trash: ["Сміття / розчистка", "Мусор / расчистка"],
    mixed: ["Змішаний демонтаж", "Смешанный демонтаж"],
    other: ["Інше", "Другое"],
  };
  const pair = map[id] ?? map.other;
  return tr(lang, pair[0], pair[1]);
}

export function statusLabel(lang: Lang, status: JobStatus) {
  const map: Record<JobStatus, [string, string]> = {
    estimate: ["Кошторис", "Смета"],
    active: ["В роботі", "В работе"],
    done: ["Здано", "Сдано"],
    lost: ["Відмова", "Отказ"],
  };
  return tr(lang, map[status][0], map[status][1]);
}

export function clientTypeLabel(lang: Lang, type: ClientType) {
  const map: Record<ClientType, [string, string]> = {
    private: ["Приватний", "Частник"],
    foreman: ["Прораб", "Прораб"],
    company: ["Компанія", "Компания"],
    realtor: ["Рієлтор", "Риелтор"],
  };
  return tr(lang, map[type][0], map[type][1]);
}

export function haulLabel(lang: Lang, haul: Haul) {
  const map: Record<Haul, [string, string]> = {
    we: ["Вивозимо ми", "Вывозим мы"],
    client: ["Вивіз на замовнику", "Вывоз на заказчике"],
    unknown: ["Вивіз не узгоджено", "Вывоз не согласован"],
  };
  return tr(lang, map[haul][0], map[haul][1]);
}

export function repeatLabel(lang: Lang, value: RepeatFlag) {
  const map: Record<RepeatFlag, [string, string]> = {
    none: ["Повтору не видно", "Повтора не видно"],
    maybe: ["Можливий повтор", "Возможен повтор"],
    yes: ["Дає повтори", "Даёт повторы"],
  };
  return tr(lang, map[value][0], map[value][1]);
}
