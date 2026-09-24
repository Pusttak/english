import { useMemo, useState } from "react";
import type { CefrLevel, Grade } from "../types";
import { buildReverseQueue, CONCEPTS, LEVELS, type ReverseQueueItem } from "../lib/concepts";
import { loadReverseLevels, saveReverseLevels } from "../lib/storage";
import { LEVEL_COLORS } from "../lib/ui";
import { ReverseFlashcard } from "../components/ReverseFlashcard";
import { GradeButtons } from "../components/GradeButtons";
import type { useProgress } from "../hooks/useProgress";

const CARD_BY_ID = new Map(CONCEPTS.flatMap((c) => c.cards).map((card) => [card.id, card]));

interface Props {
  progressApi: ReturnType<typeof useProgress>;
}

export function ReverseView({ progressApi }: Props) {
  const { progress, review, todayLog, stats, setDailyNewGoal, newWordsRemaining } = progressApi;
  const [levels, setLevels] = useState<CefrLevel[]>(() => loadReverseLevels(LEVELS));
  const [queue, setQueue] = useState<ReverseQueueItem[] | null>(null);
  const [revealed, setRevealed] = useState(false);

  const levelSet = useMemo(() => new Set(levels), [levels]);

  const toggleLevel = (level: CefrLevel) => {
    const next = levelSet.has(level) ? levels.filter((l) => l !== level) : [...levels, level];
    if (next.length === 0) return;
    setLevels(next);
    saveReverseLevels(next);
  };

  const startSession = () => {
    setQueue(buildReverseQueue(progress, levelSet, newWordsRemaining));
    setRevealed(false);
  };

  if (queue === null) {
    const items = buildReverseQueue(progress, levelSet, newWordsRemaining);
    const newCount = items.filter((i) => i.isNew).length;
    const dueCount = items.length - newCount;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-5xl">🔁</p>
        <h2 className="text-xl font-semibold text-gray-800">Русский → английский</h2>
        <p className="max-w-xs text-sm text-gray-500">
          Слова с одним смыслом собраны вместе: сначала простое слово, потом более сложные синонимы.
        </p>

        <div className="flex gap-2">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => toggleLevel(level)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                levelSet.has(level) ? LEVEL_COLORS[level] : "bg-gray-100 text-gray-400"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="flex w-full max-w-xs items-center gap-3">
          <span className="shrink-0 text-xs text-gray-500">Новых в день</span>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={stats.dailyNewGoal}
            onChange={(e) => setDailyNewGoal(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-6 text-right text-sm font-semibold text-gray-700">{stats.dailyNewGoal}</span>
        </div>

        <p className="text-sm text-gray-500">
          {items.length > 0
            ? `К повторению: ${dueCount} · новых: ${newCount}`
            : "На сегодня всё повторено. Выбери больше уровней или загляни завтра."}
        </p>
        {items.length > 0 && (
          <button
            type="button"
            onClick={startSession}
            className="rounded-2xl bg-violet-600 px-8 py-4 text-lg font-semibold text-white active:scale-[0.98]"
          >
            Начать
          </button>
        )}
      </div>
    );
  }

  const current = queue[0];

  if (!current) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="text-xl font-semibold text-gray-800">Сессия завершена!</h2>
        <p className="text-sm text-gray-500">
          Повторений сегодня: {todayLog.reviews} · Точность:{" "}
          {todayLog.reviews ? Math.round((todayLog.correct / todayLog.reviews) * 100) : 0}%
        </p>
        <button
          type="button"
          onClick={() => setQueue(null)}
          className="rounded-2xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 active:scale-[0.98]"
        >
          Назад
        </button>
      </div>
    );
  }

  const handleGrade = (grade: Grade) => {
    review(current.card.id, grade);
    setRevealed(false);
    setQueue((prev) => {
      if (!prev) return prev;
      const [, ...rest] = prev;
      return grade === "again" ? [...rest, current] : rest;
    });
  };

  // подсказка «проще уже знаешь» — только про карточки, которые пользователь уже проходил
  const known = current.card.easier.filter((w) => {
    const easierCard = CARD_BY_ID.get(`${current.card.conceptId}:${w.level}`);
    return easierCard && (progress[easierCard.id]?.reps ?? 0) >= 1;
  });

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{current.isNew ? "Новая карточка" : "Повторение"}</span>
        <span>Осталось в очереди: {queue.length}</span>
      </div>
      <ReverseFlashcard
        key={current.card.id}
        card={current.card}
        known={known}
        revealed={revealed}
        onReveal={() => setRevealed(true)}
      />
      {revealed && <GradeButtons onGrade={handleGrade} />}
    </div>
  );
}
