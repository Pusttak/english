import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppStats, Grade, ProgressMap, WordProgress } from "../types";
import { loadProgress, loadStats, saveProgress, saveStats } from "../lib/storage";
import { createNewProgress, markLearned, resetProgress, reviewWord, todayISO } from "../lib/srs";

function ensureLog(stats: AppStats, date: string): AppStats {
  if (stats.log[date]) return stats;
  return {
    ...stats,
    log: { ...stats.log, [date]: { date, reviews: 0, correct: 0, newWords: 0 } },
  };
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const [stats, setStats] = useState<AppStats>(() => loadStats());

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => saveStats(stats), [stats]);

  const today = todayISO();
  const todayLog = stats.log[today] ?? { date: today, reviews: 0, correct: 0, newWords: 0 };

  const getProgress = useCallback(
    (id: string): WordProgress => progress[id] ?? createNewProgress(),
    [progress],
  );

  const review = useCallback(
    (id: string, grade: Grade) => {
      const current = progress[id] ?? createNewProgress();
      const wasNew = current.status === "new";
      const next = reviewWord(current, grade);
      setProgress((prev) => ({ ...prev, [id]: next }));
      setStats((prev) => {
        const withLog = ensureLog(prev, today);
        const entry = withLog.log[today];
        return {
          ...withLog,
          log: {
            ...withLog.log,
            [today]: {
              ...entry,
              reviews: entry.reviews + 1,
              correct: entry.correct + (grade === "again" ? 0 : 1),
              newWords: entry.newWords + (wasNew ? 1 : 0),
            },
          },
        };
      });
    },
    [progress, today],
  );

  const toggleLearned = useCallback((id: string) => {
    setProgress((prev) => {
      const current = prev[id] ?? createNewProgress();
      const next = current.status === "learned" ? resetProgress() : markLearned(current);
      return { ...prev, [id]: next };
    });
  }, []);

  const setDailyNewGoal = useCallback((n: number) => {
    setStats((prev) => ({ ...prev, dailyNewGoal: n }));
  }, []);

  const newWordsRemaining = Math.max(0, stats.dailyNewGoal - todayLog.newWords);

  return useMemo(
    () => ({
      progress,
      stats,
      todayLog,
      getProgress,
      review,
      toggleLearned,
      setDailyNewGoal,
      newWordsRemaining,
    }),
    [progress, stats, todayLog, getProgress, review, toggleLearned, setDailyNewGoal, newWordsRemaining],
  );
}
