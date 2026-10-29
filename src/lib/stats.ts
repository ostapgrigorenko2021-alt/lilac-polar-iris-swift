import { sumParts } from "@/lib/calc";
import type { Job, Lang } from "@/lib/types";
import { format, subMonths } from "date-fns";
import { ru, uk } from "date-fns/locale";

export function jobProfit(job: Job, fact = false) {
  const cost = sumParts(fact ? job.actual : job.planned);
  return job.clientPrice - cost;
}

export function dashboardStats(objects: Job[]) {
  const live = objects.filter((job) => job.status !== "lost");
  const profit = live.reduce((sum, job) => sum + jobProfit(job, job.status === "done"), 0);
  const priced = live.filter((job) => job.clientPrice > 0);
  const avg = priced.length ? priced.reduce((sum, job) => sum + job.clientPrice, 0) / priced.length : 0;
  const margins = priced.map((job) => (job.clientPrice > 0 ? (jobProfit(job, job.status === "done") / job.clientPrice) * 100 : 0));
  const avgMargin = margins.length ? margins.reduce((sum, value) => sum + value, 0) / margins.length : 0;
  const month = new Date().toISOString().slice(0, 7);
  const monthCount = live.filter((job) => job.createdAt.slice(0, 7) === month).length;
  return {
    profit: Math.round(profit),
    avg: Math.round(avg),
    avgMargin,
    monthCount,
    total: live.length,
  };
}

export function monthSeries(objects: Job[], lang: Lang) {
  const locale = lang === "ru" ? ru : uk;
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(now, 5 - index);
    const key = format(date, "yyyy-MM");
    const label = format(date, "LLL yy", { locale });
    let plan = 0;
    let fact = 0;
    for (const job of objects) {
      if (job.status === "lost" || job.createdAt.slice(0, 7) !== key) continue;
      plan += jobProfit(job, false);
      if (job.status === "done") fact += jobProfit(job, true);
    }
    return { label, plan: Math.round(plan), fact: Math.round(fact) };
  });
}
