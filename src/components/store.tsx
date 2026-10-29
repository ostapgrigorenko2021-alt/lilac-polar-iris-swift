import { Onboarding } from "@/components/onboarding";
import { NORM_SEED } from "@/data/norms";
import { compute } from "@/lib/calc";
import { defaultDraft, freshData } from "@/lib/defaults";
import { uid } from "@/lib/format";
import { loadData, saveData } from "@/lib/persist";
import type {
  AppData,
  CalcDraft,
  CatalogItem,
  Client,
  CoefFlags,
  Job,
  Norm,
  PriceLine,
  PriceOverride,
  Profile,
  SiteLog,
  SiteSession,
  Tier,
  Worker,
} from "@/lib/types";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const Ctx = createContext<StoreApi | null>(null);

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("store");
  return ctx;
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const data = value as AppData;
  return data.version === 1 && Boolean(data.profile) && Array.isArray(data.objects) && Boolean(data.draft);
}

function normalize(data: AppData): AppData {
  const base = freshData();
  return {
    ...base,
    ...data,
    version: 1,
    profile: { ...base.profile, ...data.profile },
    draft: {
      ...base.draft,
      ...data.draft,
      coef: { ...base.draft.coef, ...(data.draft?.coef ?? {}) },
      lines: data.draft?.lines ?? [],
      safety: data.draft?.safety ?? {},
      workerIds: data.draft?.workerIds ?? [],
    },
    site: { ...base.site, ...(data.site ?? {}) },
    norms: data.norms?.length ? data.norms : base.norms,
    priceOverrides: data.priceOverrides ?? {},
    customPrices: data.customPrices ?? [],
    logs: data.logs ?? [],
    objects: data.objects ?? [],
    clients: data.clients ?? [],
    workers: data.workers ?? [],
    seq: data.seq || 1,
  };
}

export interface StoreApi {
  data: AppData;
  setProfile: (patch: Partial<Profile>) => void;
  finishOnboarding: (profile: Profile) => void;
  setDraft: (patch: Partial<CalcDraft>) => void;
  setCoef: (patch: Partial<CoefFlags>) => void;
  addLine: (line: PriceLine) => void;
  updateLine: (id: string, patch: Partial<PriceLine>) => void;
  removeLine: (id: string) => void;
  clearDraft: () => void;
  saveJob: (tier: Tier) => string;
  updateJob: (id: string, patch: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  saveClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  saveWorker: (worker: Worker) => void;
  deleteWorker: (id: string) => void;
  saveNorm: (norm: Norm) => void;
  deleteNorm: (id: string) => void;
  resetNorms: () => void;
  setOverride: (id: string, patch: PriceOverride) => void;
  resetOverride: (id: string) => void;
  saveCustomPrice: (item: CatalogItem) => void;
  deleteCustomPrice: (id: string) => void;
  resetPrices: () => void;
  setSite: (patch: Partial<SiteSession>) => void;
  addLog: (log: SiteLog) => void;
  replaceData: (raw: unknown) => boolean;
  wipeJobs: () => void;
  wipeAll: () => void;
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="text-center">
        <p className="font-mono text-sm tracking-widest text-amber">Т-СИКС-Т</p>
        <h1 className="mt-2 text-2xl font-semibold">Помічник різноробочого</h1>
      </div>
    </div>
  );
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    let cancel = false;
    const timer = window.setTimeout(() => {
      if (!cancel) setData((prev) => prev ?? freshData());
    }, 1500);
    loadData()
      .then((loaded) => {
        if (cancel) return;
        setData(loaded ? normalize(loaded) : freshData());
      })
      .catch(() => {
        if (!cancel) setData(freshData());
      });
    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    const timer = window.setTimeout(() => {
      void saveData(data);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    if (!data) return;
    document.documentElement.classList.toggle("light", data.profile.theme === "light");
    document.documentElement.lang = data.profile.lang === "ru" ? "ru" : "uk";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", data.profile.theme === "light" ? "#efece3" : "#13150f");
  }, [data]);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  if (!data) return <Splash />;

  const api: StoreApi = {
    data,
    setProfile: (patch) => setData((prev) => (prev ? { ...prev, profile: { ...prev.profile, ...patch } } : prev)),
    finishOnboarding: (profile) =>
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...profile, onboarded: true };
        return { ...prev, profile: next, draft: defaultDraft(next) };
      }),
    setDraft: (patch) => setData((prev) => (prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev)),
    setCoef: (patch) =>
      setData((prev) => (prev ? { ...prev, draft: { ...prev.draft, coef: { ...prev.draft.coef, ...patch } } } : prev)),
    addLine: (line) =>
      setData((prev) =>
        prev ? { ...prev, draft: { ...prev.draft, basis: "lines", lines: [...prev.draft.lines, line] } } : prev,
      ),
    updateLine: (id, patch) =>
      setData((prev) =>
        prev
          ? {
              ...prev,
              draft: { ...prev.draft, lines: prev.draft.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)) },
            }
          : prev,
      ),
    removeLine: (id) =>
      setData((prev) =>
        prev ? { ...prev, draft: { ...prev.draft, lines: prev.draft.lines.filter((line) => line.id !== id) } } : prev,
      ),
    clearDraft: () => setData((prev) => (prev ? { ...prev, draft: defaultDraft(prev.profile) } : prev)),
    saveJob: (tier) => {
      const id = uid("job");
      setData((prev) => {
        if (!prev) return prev;
        const result = compute(prev.draft);
        const useLines = prev.draft.basis === "lines" && prev.draft.lines.length > 0;
        const laborBase = useLines ? result.lineLabor : result.crewLabor;
        const picked =
          tier === "min" ? result.min : tier === "rush" ? result.rush : tier === "list" ? null : result.work;
        const clientPrice = picked ? picked.price : result.listPrice;
        const labor = picked ? picked.labor : laborBase;
        const planned = {
          labor: Math.round(labor),
          tools: Math.round(Math.max(0, prev.draft.tools)),
          consumables: Math.round(Math.max(0, prev.draft.consumables)),
          transport: Math.round(Math.max(0, tier === "rush" ? prev.draft.transport * 1.15 : prev.draft.transport)),
          waste: Math.round(result.waste),
          other: 0,
        };
        const draft = prev.draft;
        let clients = prev.clients;
        let clientId = draft.clientId;
        const name = draft.clientName.trim();
        if (!clientId && name) {
          const existing = clients.find((client) => client.name.trim().toLowerCase() === name.toLowerCase());
          if (existing) clientId = existing.id;
          else {
            clientId = uid("cl");
            clients = [
              ...clients,
              { id: clientId, name, phone: draft.clientPhone.trim(), type: "private", notes: "", repeatOrders: false },
            ];
          }
        }
        const client = clients.find((item) => item.id === clientId);
        const safetyStop = ["bearing", "gas", "hazard", "collapse"].some((key) => draft.safety[key]);
        const now = new Date().toISOString();
        const blank = prev.profile.lang === "ru" ? "Адрес не указан" : "Адресу не вказано";
        const job: Job = {
          id,
          number: `T-${String(prev.seq).padStart(3, "0")}`,
          createdAt: now,
          updatedAt: now,
          status: "estimate",
          address: draft.address.trim() || blank,
          objectType: draft.objectType,
          workType: draft.workType,
          area: draft.area,
          volume: draft.volume,
          floor: draft.floor,
          hasElevator: draft.hasElevator,
          noise: draft.noise,
          timeLimit: draft.timeLimit,
          hasWater: draft.hasWater,
          hasPower: draft.hasPower,
          storage: draft.storage,
          whoHauls: draft.whoHauls,
          wasteM3: draft.wasteM3,
          wasteBags: draft.wasteBags,
          safety: draft.safety,
          safetyStop,
          clientId,
          clientName: client?.name || name,
          clientPhone: client?.phone || draft.clientPhone.trim(),
          workerIds: draft.workerIds,
          people: draft.people,
          shifts: draft.shifts,
          deadline: "",
          tier,
          clientPrice,
          advance: 0,
          planned,
          actual: { ...planned },
          problems: "",
          learned: "",
          improve: "",
          repeat: "none",
          photosBefore: [],
          photosAfter: [],
          notes: "",
          lines: draft.lines,
        };
        return { ...prev, seq: prev.seq + 1, clients, objects: [job, ...prev.objects] };
      });
      return id;
    },
    updateJob: (id, patch) =>
      setData((prev) =>
        prev
          ? {
              ...prev,
              objects: prev.objects.map((job) => (job.id === id ? { ...job, ...patch, updatedAt: new Date().toISOString() } : job)),
            }
          : prev,
      ),
    deleteJob: (id) => setData((prev) => (prev ? { ...prev, objects: prev.objects.filter((job) => job.id !== id) } : prev)),
    saveClient: (client) =>
      setData((prev) => {
        if (!prev) return prev;
        const exists = prev.clients.some((item) => item.id === client.id);
        return {
          ...prev,
          clients: exists ? prev.clients.map((item) => (item.id === client.id ? client : item)) : [client, ...prev.clients],
        };
      }),
    deleteClient: (id) => setData((prev) => (prev ? { ...prev, clients: prev.clients.filter((client) => client.id !== id) } : prev)),
    saveWorker: (worker) =>
      setData((prev) => {
        if (!prev) return prev;
        const exists = prev.workers.some((item) => item.id === worker.id);
        return {
          ...prev,
          workers: exists ? prev.workers.map((item) => (item.id === worker.id ? worker : item)) : [worker, ...prev.workers],
        };
      }),
    deleteWorker: (id) => setData((prev) => (prev ? { ...prev, workers: prev.workers.filter((worker) => worker.id !== id) } : prev)),
    saveNorm: (norm) =>
      setData((prev) => {
        if (!prev) return prev;
        const exists = prev.norms.some((item) => item.id === norm.id);
        return { ...prev, norms: exists ? prev.norms.map((item) => (item.id === norm.id ? norm : item)) : [norm, ...prev.norms] };
      }),
    deleteNorm: (id) => setData((prev) => (prev ? { ...prev, norms: prev.norms.filter((norm) => norm.id !== id) } : prev)),
    resetNorms: () => setData((prev) => (prev ? { ...prev, norms: NORM_SEED.map((norm) => ({ ...norm })) } : prev)),
    setOverride: (id, patch) =>
      setData((prev) => (prev ? { ...prev, priceOverrides: { ...prev.priceOverrides, [id]: { ...prev.priceOverrides[id], ...patch } } } : prev)),
    resetOverride: (id) =>
      setData((prev) => {
        if (!prev) return prev;
        const next = { ...prev.priceOverrides };
        delete next[id];
        return { ...prev, priceOverrides: next };
      }),
    saveCustomPrice: (item) =>
      setData((prev) => {
        if (!prev) return prev;
        const exists = prev.customPrices.some((price) => price.id === item.id);
        return {
          ...prev,
          customPrices: exists
            ? prev.customPrices.map((price) => (price.id === item.id ? item : price))
            : [...prev.customPrices, item],
        };
      }),
    deleteCustomPrice: (id) =>
      setData((prev) => (prev ? { ...prev, customPrices: prev.customPrices.filter((item) => item.id !== id) } : prev)),
    resetPrices: () => setData((prev) => (prev ? { ...prev, priceOverrides: {}, customPrices: [] } : prev)),
    setSite: (patch) => setData((prev) => (prev ? { ...prev, site: { ...prev.site, ...patch } } : prev)),
    addLog: (log) => setData((prev) => (prev ? { ...prev, logs: [log, ...prev.logs] } : prev)),
    replaceData: (raw) => {
      if (!isAppData(raw)) return false;
      setData(normalize({ ...raw, profile: { ...raw.profile, onboarded: true } }));
      return true;
    },
    wipeJobs: () =>
      setData((prev) => (prev ? { ...prev, objects: [], clients: [], workers: [], logs: [] } : prev)),
    wipeAll: () => setData(freshData()),
  };

  return (
    <Ctx.Provider value={api}>
      {data.profile.onboarded ? children : <Onboarding />}
    </Ctx.Provider>
  );
}
