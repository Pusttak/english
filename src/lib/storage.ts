import type { AppStats, CefrLevel, ProgressMap } from "../types";

export interface StorageKeys {
  progress: string;
  stats: string;
}

export const EN_RU_KEYS: StorageKeys = { progress: "eng_progress_v1", stats: "eng_stats_v1" };
export const RU_EN_KEYS: StorageKeys = { progress: "eng_ru_progress_v1", stats: "eng_ru_stats_v1" };

const RU_EN_LEVELS_KEY = "eng_ru_levels_v1";

export function loadProgress(keys: StorageKeys): ProgressMap {
  try {
    const raw = localStorage.getItem(keys.progress);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function saveProgress(map: ProgressMap, keys: StorageKeys): void {
  localStorage.setItem(keys.progress, JSON.stringify(map));
}

export function loadStats(keys: StorageKeys): AppStats {
  try {
    const raw = localStorage.getItem(keys.stats);
    if (raw) return JSON.parse(raw) as AppStats;
  } catch {
    // ignore
  }
  return { log: {}, dailyNewGoal: 10 };
}

export function saveStats(stats: AppStats, keys: StorageKeys): void {
  localStorage.setItem(keys.stats, JSON.stringify(stats));
}

export function loadReverseLevels(all: CefrLevel[]): CefrLevel[] {
  try {
    const raw = localStorage.getItem(RU_EN_LEVELS_KEY);
    if (raw) {
      const saved = (JSON.parse(raw) as CefrLevel[]).filter((l) => all.includes(l));
      if (saved.length > 0) return saved;
    }
  } catch {
    // ignore
  }
  return all;
}

export function saveReverseLevels(levels: CefrLevel[]): void {
  localStorage.setItem(RU_EN_LEVELS_KEY, JSON.stringify(levels));
}
