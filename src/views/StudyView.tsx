import { useState } from "react";
import words from "../data/words.json";
import type { Grade, Word } from "../types";
import { buildQueue, type QueueItem } from "../lib/queue";
import { Flashcard } from "../components/Flashcard";
import { GradeButtons } from "../components/GradeButtons";
import type { useProgress } from "../hooks/useProgress";

const WORDS = words as Word[];

interface Props {
  progressApi: ReturnType<typeof useProgress>;
}

export function StudyView({ progressApi }: Props) {
  const { progress, review, todayLog, newWordsRemaining } = progressApi;
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [revealed, setRevealed] = useState(false);

  const startSession = () => {
    setQueue(buildQueue(WORDS, progress, newWordsRemaining));
    setRevealed(false);
  };

  if (queue === null) {
    const dueCount = buildQueue(WORDS, progress, newWordsRemaining).length;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-5xl">📚</p>
        <h2 className="text-xl font-semibold text-gray-800">Готов к занятию?</h2>
        <p className="max-w-xs text-sm text-gray-500">
          {dueCount > 0
            ? `Сегодня к повторению: ${dueCount} слов`
            : "На сегодня всё повторено. Загляни в раздел «Слова», чтобы изучить больше."}
        </p>
        {dueCount > 0 && (
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
    review(current.word.id, grade);
    setRevealed(false);
    setQueue((prev) => {
      if (!prev) return prev;
      const [, ...rest] = prev;
      return grade === "again" ? [...rest, current] : rest;
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{current.isNew ? "Новое слово" : "Повторение"}</span>
        <span>Осталось в очереди: {queue.length}</span>
      </div>
      <Flashcard word={current.word} revealed={revealed} onReveal={() => setRevealed(true)} />
      {revealed && <GradeButtons onGrade={handleGrade} />}
    </div>
  );
}
