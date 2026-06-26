import type { AppStats, ProgressMap } from "../types";

const PROGRESS_KEY = "eng_progress_v1";
const STATS_KEY = "eng_stats_v1";

export function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function saveProgress(map: ProgressMap): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}

export function loadStats(): AppStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw) as AppStats;
  } catch {
    // ignore
  }
  return { log: {}, dailyNewGoal: 10 };
}

export function saveStats(stats: AppStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
