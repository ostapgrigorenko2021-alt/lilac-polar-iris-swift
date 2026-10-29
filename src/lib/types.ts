export type Lang = "uk" | "ru";
export type Stage = "worker" | "organizer" | "contractor";
export type RateUnit = "shift" | "hour";
export type Tier = "min" | "work" | "rush" | "list";
export type JobStatus = "estimate" | "active" | "done" | "lost";
export type ClientType = "private" | "foreman" | "company" | "realtor";
export type RepeatFlag = "none" | "maybe" | "yes";
export type Haul = "we" | "client" | "unknown";
export type Basis = "crew" | "lines";

export interface Profile {
  onboarded: boolean;
  lang: Lang;
  theme: "dark" | "light";
  stage: Stage;
  rate: number;
  rateUnit: RateUnit;
  contingency: number;
  profitMode: "percent" | "fixed";
  profitValue: number;
}

export interface CostParts {
  labor: number;
  tools: number;
  consumables: number;
  transport: number;
  waste: number;
  other: number;
}

export interface PriceLine {
  id: string;
  priceId: string;
  nameUk: string;
  nameRu: string;
  unit: string;
  qty: number;
  clientUnit: number;
  workerUnit: number;
}

export interface CoefFlags {
  noLift: boolean;
  height: boolean;
  tight: boolean;
  heavy: boolean;
  heat: boolean;
  rush: boolean;
  noUtils: boolean;
}

export interface CalcDraft {
  address: string;
  objectType: string;
  workType: string;
  area: number;
  volume: number;
  floor: number;
  hasElevator: boolean;
  noise: string;
  timeLimit: string;
  hasWater: boolean;
  hasPower: boolean;
  storage: string;
  whoHauls: Haul;
  wasteM3: number;
  wasteBags: number;
  safety: Record<string, boolean>;
  safetyAck: boolean;
  people: number;
  shifts: number;
  rate: number;
  rateUnit: RateUnit;
  hours: number;
  tools: number;
  consumables: number;
  transport: number;
  wasteRate: number;
  contingency: number;
  profitMode: "percent" | "fixed";
  profitValue: number;
  coef: CoefFlags;
  lines: PriceLine[];
  basis: Basis;
  clientName: string;
  clientPhone: string;
  clientId: string;
  workerIds: string[];
}

export interface CatalogItem {
  id: string;
  section: string;
  uk: string;
  ru: string;
  unit: string;
  marketMin: number;
  marketMax: number;
  price: number;
  worker: number;
  inUk: string;
  inRu: string;
  exUk: string;
  exRu: string;
  hazard: "" | "stop" | "warn";
  custom?: boolean;
  overridden?: boolean;
}

export type PriceOverride = Partial<
  Pick<CatalogItem, "marketMin" | "marketMax" | "price" | "worker" | "inUk" | "inRu" | "exUk" | "exRu">
>;

export interface Job {
  id: string;
  number: string;
  createdAt: string;
  updatedAt: string;
  status: JobStatus;
  address: string;
  objectType: string;
  workType: string;
  area: number;
  volume: number;
  floor: number;
  hasElevator: boolean;
  noise: string;
  timeLimit: string;
  hasWater: boolean;
  hasPower: boolean;
  storage: string;
  whoHauls: Haul;
  wasteM3: number;
  wasteBags: number;
  safety: Record<string, boolean>;
  safetyStop: boolean;
  clientId: string;
  clientName: string;
  clientPhone: string;
  workerIds: string[];
  people: number;
  shifts: number;
  deadline: string;
  tier: Tier;
  clientPrice: number;
  advance: number;
  planned: CostParts;
  actual: CostParts;
  problems: string;
  learned: string;
  improve: string;
  repeat: RepeatFlag;
  photosBefore: string[];
  photosAfter: string[];
  notes: string;
  lines: PriceLine[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  type: ClientType;
  notes: string;
  repeatOrders: boolean;
}

export interface Worker {
  id: string;
  name: string;
  specialty: string;
  dayRate: number;
  quality: number;
  speed: number;
  reliability: number;
  phone: string;
}

export interface Norm {
  id: string;
  uk: string;
  ru: string;
  unit: string;
  output: number;
  noteUk: string;
  noteRu: string;
  custom?: boolean;
}

export interface SiteLog {
  id: string;
  objectId: string;
  at: string;
  elapsedSec: number;
  volume: number;
  volumeUnit: string;
  materials: string;
  note: string;
}

export interface SiteSession {
  running: boolean;
  startedAt: number | null;
  baseElapsed: number;
  objectId: string;
  volume: number;
  volumeUnit: string;
  materials: string;
  note: string;
}

export interface AppData {
  version: 1;
  seq: number;
  profile: Profile;
  draft: CalcDraft;
  objects: Job[];
  clients: Client[];
  workers: Worker[];
  norms: Norm[];
  priceOverrides: Record<string, PriceOverride>;
  customPrices: CatalogItem[];
  logs: SiteLog[];
  site: SiteSession;
}
