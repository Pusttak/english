import type { AppStats } from "../types";
import { addDays, todayISO } from "./srs";

export function computeStreak(stats: AppStats): number {
  let streak = 0;
  let date = todayISO();
  const todayHasActivity = (stats.log[date]?.reviews ?? 0) > 0;
  if (!todayHasActivity) {
    date = addDays(date, -1);
  }
  while ((stats.log[date]?.reviews ?? 0) > 0) {
    streak += 1;
    date = addDays(date, -1);
  }
  return streak;
}

export function last7DaysLog(stats: AppStats) {
  const days = [];
  let date = todayISO();
  for (let i = 0; i < 7; i++) {
    days.push(stats.log[date] ?? { date, reviews: 0, correct: 0, newWords: 0 });
    date = addDays(date, -1);
  }
  return days.reverse();
}
