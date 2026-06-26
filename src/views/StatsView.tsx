import { useMemo } from "react";
import words from "../data/words.json";
import type { Word, WordStatus } from "../types";
import { computeStreak, last7DaysLog } from "../lib/statsCalc";
import { STATUS_COLORS, STATUS_LABELS } from "../lib/ui";
import type { useProgress } from "../hooks/useProgress";

const WORDS = words as Word[];
const STATUSES: WordStatus[] = ["new", "learning", "review", "learned"];

interface Props {
  progressApi: ReturnType<typeof useProgress>;
}

export function StatsView({ progressApi }: Props) {
  const { progress, stats, todayLog, setDailyNewGoal } = progressApi;

  const counts = useMemo(() => {
    const c: Record<WordStatus, number> = { new: 0, learning: 0, review: 0, learned: 0 };
    for (const w of WORDS) {
      const st = progress[w.id]?.status ?? "new";
      c[st] += 1;
    }
    return c;
  }, [progress]);

  const total = WORDS.length;
  const learnedPct = Math.round((counts.learned / total) * 100);
  const streak = computeStreak(stats);
  const week = last7DaysLog(stats);
  const accuracyToday = todayLog.reviews ? Math.round((todayLog.correct / todayLog.reviews) * 100) : null;

  const byLevel = useMemo(() => {
    const levels: Record<string, { total: number; learned: number }> = {};
    for (const w of WORDS) {
      levels[w.level] ??= { total: 0, learned: 0 };
      levels[w.level].total += 1;
      if ((progress[w.id]?.status ?? "new") === "learned") levels[w.level].learned += 1;
    }
    return levels;
  }, [progress]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
      <div className="rounded-2xl bg-violet-600 p-5 text-white">
        <p className="text-sm opacity-80">Общий прогресс</p>
        <p className="text-3xl font-bold">{learnedPct}%</p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white" style={{ width: `${learnedPct}%` }} />
        </div>
        <p className="mt-2 text-xs opacity-80">
          {counts.learned} из {total} слов изучено
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">🔥 {streak}</p>
          <p className="text-xs text-gray-500">дней подряд</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{todayLog.reviews}</p>
          <p className="text-xs text-gray-500">
            повторений сегодня{accuracyToday !== null ? ` · ${accuracyToday}%` : ""}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">По статусу</p>
        <div className="flex flex-col gap-2">
          {STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-24 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ${STATUS_COLORS[s]}`}>
                {STATUS_LABELS[s]}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${(counts[s] / total) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-gray-400">{counts[s]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">По уровню CEFR</p>
        <div className="flex flex-col gap-2">
          {Object.entries(byLevel).map(([lvl, v]) => (
            <div key={lvl} className="flex items-center gap-2">
              <span className="w-10 shrink-0 text-xs font-semibold text-gray-600">{lvl}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(v.learned / v.total) * 100}%` }}
                />
              </div>
              <span className="w-14 text-right text-xs text-gray-400">
                {v.learned}/{v.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">Последние 7 дней</p>
        <div className="flex items-end justify-between gap-1">
          {week.map((d) => {
            const max = Math.max(1, ...week.map((x) => x.reviews));
            const h = Math.max(4, Math.round((d.reviews / max) * 56));
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-14 w-full items-end justify-center">
                  <div className="w-5 rounded-t-md bg-violet-400" style={{ height: `${h}px` }} />
                </div>
                <span className="text-[10px] text-gray-400">{d.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-gray-700">Новых слов в день</p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={stats.dailyNewGoal}
            onChange={(e) => setDailyNewGoal(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-8 text-right text-sm font-semibold text-gray-700">{stats.dailyNewGoal}</span>
        </div>
      </div>
    </div>
  );
}
