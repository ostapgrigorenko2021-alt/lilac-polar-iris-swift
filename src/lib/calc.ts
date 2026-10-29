import type { CalcDraft, CoefFlags, CostParts } from "@/lib/types";

export const STOP_KEYS = ["bearing", "gas", "hazard", "collapse"] as const;
export const WARN_KEYS = ["electric", "height"] as const;

export function emptyCoef(): CoefFlags {
  return {
    noLift: false,
    height: false,
    tight: false,
    heavy: false,
    heat: false,
    rush: false,
    noUtils: false,
  };
}

export function laborMult(coef: CoefFlags, floor: number, hasElevator: boolean) {
  let add = 0;
  if (coef.noLift && !hasElevator && floor > 1) add += Math.min(0.08 * (floor - 1), 0.4);
  else if (coef.noLift && floor > 1) add += Math.min(0.04 * (floor - 1), 0.2);
  if (coef.height) add += 0.2;
  if (coef.tight) add += 0.15;
  if (coef.heavy) add += 0.2;
  if (coef.heat) add += 0.1;
  if (coef.noUtils) add += 0.1;
  return 1 + add;
}

export function sumParts(c: CostParts) {
  return c.labor + c.tools + c.consumables + c.transport + c.waste + c.other;
}

export interface TierResult {
  direct: number;
  labor: number;
  waste: number;
  contingency: number;
  profit: number;
  price: number;
  marginPct: number;
}

export interface CalcResult {
  mult: number;
  crewRaw: number;
  lineRaw: number;
  crewLabor: number;
  lineLabor: number;
  waste: number;
  listPrice: number;
  min: TierResult;
  work: TierResult;
  rush: TierResult;
}

function pack(direct: number, labor: number, waste: number, contingency: number, profit: number): TierResult {
  const price = Math.max(0, Math.round(direct + contingency + profit));
  const marginPct = price > 0 ? (profit / price) * 100 : 0;
  return {
    direct: Math.round(direct),
    labor: Math.round(labor),
    waste: Math.round(waste),
    contingency: Math.round(contingency),
    profit: Math.round(profit),
    price,
    marginPct,
  };
}

export function compute(d: CalcDraft): CalcResult {
  const mult = laborMult(d.coef, d.floor, d.hasElevator);
  const shiftRate = d.rateUnit === "hour" ? d.rate * (d.hours || 8) : d.rate;
  const crewRaw = Math.max(0, d.people) * Math.max(0, d.shifts) * Math.max(0, shiftRate);
  const lineRaw = d.lines.reduce((sum, line) => sum + Math.max(0, line.qty) * Math.max(0, line.workerUnit), 0);
  const crewLabor = crewRaw * mult;
  const lineLabor = lineRaw * mult;
  const useLines = d.basis === "lines" && d.lines.length > 0;
  const labor = useLines ? lineLabor : crewLabor;
  const waste = d.whoHauls === "we" ? Math.max(0, d.wasteM3) * Math.max(0, d.wasteRate) : 0;
  const overhead = Math.max(0, d.tools) + Math.max(0, d.consumables) + Math.max(0, d.transport);
  const direct = labor + overhead + waste;

  const contPct = Math.min(40, Math.max(0, d.contingency));
  const profitOn = (base: number, factor: number) =>
    d.profitMode === "fixed" ? Math.max(0, d.profitValue) * factor : base * (Math.max(0, d.profitValue) / 100) * factor;

  const minCont = direct * 0.1;
  const min = pack(direct, labor, waste, minCont, 0);

  const workCont = direct * (contPct / 100);
  const workProfit = profitOn(direct + workCont, 1);
  const work = pack(direct, labor, waste, workCont, workProfit);

  const rushFactor = d.coef.rush ? 1.15 : 1.3;
  const rushLabor = (useLines ? lineRaw : crewRaw) * mult * rushFactor;
  const rushTransport = Math.max(0, d.transport) * 1.15;
  const rushOver = Math.max(0, d.tools) + Math.max(0, d.consumables) + rushTransport;
  const rushDirect = rushLabor + rushOver + waste;
  const rushCont = rushDirect * 0.15;
  const rushProfit = profitOn(rushDirect + rushCont, 1.5);
  const rush = pack(rushDirect, rushLabor, waste, rushCont, rushProfit);

  const listPrice = Math.round(d.lines.reduce((sum, line) => sum + Math.max(0, line.qty) * Math.max(0, line.clientUnit), 0) * mult);

  return { mult, crewRaw, lineRaw, crewLabor, lineLabor, waste, listPrice, min, work, rush };
}

export function wasteFrom(workType: string, area: number, volume: number) {
  const factor: Record<string, number> = {
    tile: 0.025,
    screed: 0.05,
    gkl: 0.035,
    brick: 0.11,
    plaster: 0.02,
    trash: 0.04,
    mixed: 0.045,
    other: 0.03,
  };
  const fromArea = Math.max(0, area) * (factor[workType] ?? 0.03);
  const fromVolume = Math.max(0, volume) * 1.2;
  const m3 = Math.round(Math.max(fromArea, fromVolume) * 100) / 100;
  const bags = m3 <= 0 ? 0 : Math.ceil(m3 / 0.05);
  return { m3, bags };
}

export function emptyCosts(): CostParts {
  return { labor: 0, tools: 0, consumables: 0, transport: 0, waste: 0, other: 0 };
}

export function plannedFrom(d: CalcDraft, tierLabor: number, waste: number): CostParts {
  return {
    labor: Math.round(tierLabor),
    tools: Math.round(Math.max(0, d.tools)),
    consumables: Math.round(Math.max(0, d.consumables)),
    transport: Math.round(Math.max(0, d.transport)),
    waste: Math.round(waste),
    other: 0,
  };
}
