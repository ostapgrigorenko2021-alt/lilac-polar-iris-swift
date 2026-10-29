import type { AppData } from "@/lib/types";

const IDB = "tsikst";
const STORE = "kv";
const KEY = "data";
const LS = "tsikst-data";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb"));
  });
}

export async function loadData(): Promise<AppData | null> {
  try {
    const db = await openDb();
    const value = await new Promise<AppData | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as AppData | undefined) ?? null);
      req.onerror = () => reject(req.error ?? new Error("read"));
    });
    if (value?.version === 1) return value;
  } catch {
    /* fall through */
  }
  try {
    const raw = localStorage.getItem(LS);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppData;
    if (parsed?.version === 1) return parsed;
  } catch {
    return null;
  }
  return null;
}

export async function saveData(data: AppData) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(data, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("write"));
    });
  } catch {
    try {
      const slim: AppData = {
        ...data,
        objects: data.objects.map((job) => ({ ...job, photosBefore: [], photosAfter: [] })),
      };
      localStorage.setItem(LS, JSON.stringify(slim));
    } catch {
      /* quota */
    }
  }
  try {
    localStorage.setItem("tsikst-theme", data.profile.theme);
    localStorage.setItem("tsikst-lang", data.profile.lang);
  } catch {
    /* ignore */
  }
}
