import { NORM_SEED } from "@/data/norms";
import { emptyCoef } from "@/lib/calc";
import type { AppData, CalcDraft, Profile, SiteSession, Stage } from "@/lib/types";

export function profitForStage(stage: Stage) {
  if (stage === "contractor") return 30;
  if (stage === "organizer") return 25;
  return 20;
}

export function peopleForStage(stage: Stage) {
  if (stage === "contractor") return 3;
  if (stage === "organizer") return 2;
  return 1;
}

export function defaultProfile(): Profile {
  return {
    onboarded: false,
    lang: "uk",
    theme: "dark",
    stage: "worker",
    rate: 1600,
    rateUnit: "shift",
    contingency: 12,
    profitMode: "percent",
    profitValue: 20,
  };
}

export function defaultDraft(profile: Profile): CalcDraft {
  return {
    address: "",
    objectType: "flat",
    workType: "mixed",
    area: 0,
    volume: 0,
    floor: 1,
    hasElevator: true,
    noise: "none",
    timeLimit: "day",
    hasWater: true,
    hasPower: true,
    storage: "yard",
    whoHauls: "unknown",
    wasteM3: 0,
    wasteBags: 0,
    safety: {},
    safetyAck: false,
    people: peopleForStage(profile.stage),
    shifts: 1,
    rate: profile.rate,
    rateUnit: profile.rateUnit,
    hours: 8,
    tools: 0,
    consumables: 0,
    transport: 0,
    wasteRate: 1150,
    contingency: profile.contingency,
    profitMode: profile.profitMode,
    profitValue: profile.profitValue,
    coef: emptyCoef(),
    lines: [],
    basis: "crew",
    clientName: "",
    clientPhone: "",
    clientId: "",
    workerIds: [],
  };
}

export function emptySite(): SiteSession {
  return {
    running: false,
    startedAt: null,
    baseElapsed: 0,
    objectId: "",
    volume: 0,
    volumeUnit: "m2",
    materials: "",
    note: "",
  };
}

export function freshData(): AppData {
  const profile = defaultProfile();
  return {
    version: 1,
    seq: 1,
    profile,
    draft: defaultDraft(profile),
    objects: [],
    clients: [],
    workers: [],
    norms: NORM_SEED.map((norm) => ({ ...norm })),
    priceOverrides: {},
    customPrices: [],
    logs: [],
    site: emptySite(),
  };
}
