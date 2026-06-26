import type { Word } from "../types";
import { speak } from "../lib/speech";
import { LEVEL_COLORS } from "../lib/ui";

interface Props {
  word: Word;
  revealed: boolean;
  onReveal: () => void;
}

export function Flashcard({ word, revealed, onReveal }: Props) {
  return (
    <div className="flex min-h-[420px] w-full flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LEVEL_COLORS[word.level]}`}>
          {word.level}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
          {word.pos}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold text-gray-900">{word.word}</h1>
          <button
            type="button"
            aria-label="Прослушать произношение"
            onClick={() => speak(word.word)}
            className="rounded-full bg-violet-100 p-2 text-violet-600 active:scale-95"
          >
            🔊
          </button>
        </div>
        <p className="font-mono text-gray-400">{word.ipa}</p>

        {revealed && (
          <div className="mt-4 flex w-full flex-col items-center gap-3 border-t border-gray-100 pt-4">
            <p className="text-2xl font-semibold text-violet-700">{word.ru}</p>
            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center">
              <p className="text-base text-gray-700 italic">{word.example_en}</p>
              <p className="mt-1 text-sm text-gray-500">{word.example_ru}</p>
            </div>
          </div>
        )}
      </div>

      {!revealed && (
        <button
          type="button"
          onClick={onReveal}
          className="w-full rounded-2xl bg-violet-600 py-4 text-lg font-semibold text-white active:scale-[0.98]"
        >
          Показать перевод
        </button>
      )}
    </div>
  );
}
