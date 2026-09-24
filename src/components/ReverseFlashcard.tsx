import type { Word } from "../types";
import type { ReverseCard } from "../lib/concepts";
import { speak } from "../lib/speech";
import { LEVEL_COLORS } from "../lib/ui";

interface Props {
  card: ReverseCard;
  /** Более простые слова этого смысла, которые уже пройдены. */
  known: Word[];
  revealed: boolean;
  onReveal: () => void;
}

function WordChips({ words }: { words: Word[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {words.map((w) => (
        <span
          key={w.id}
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[w.level]}`}
        >
          {w.word}
        </span>
      ))}
    </span>
  );
}

export function ReverseFlashcard({ card, known, revealed, onReveal }: Props) {
  const multi = card.words.length > 1;

  return (
    <div className="flex min-h-[420px] w-full flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LEVEL_COLORS[card.level]}`}>
          {card.level}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
          {card.pos}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-4xl font-bold text-gray-900">{card.prompt}</h1>
        {known.length > 0 && (
          <p className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-gray-400">
            Проще уже знаешь: <WordChips words={known} />
          </p>
        )}
        {multi && !revealed && (
          <p className="text-sm text-gray-400">Вариантов на этом уровне: {card.words.length}</p>
        )}

        {revealed && (
          <div className="mt-4 flex w-full flex-col gap-3 border-t border-gray-100 pt-4">
            {card.words.map((w) => (
              <div key={w.id} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold text-violet-700">{w.word}</p>
                  <button
                    type="button"
                    aria-label={`Прослушать: ${w.word}`}
                    onClick={() => speak(w.word)}
                    className="rounded-full bg-violet-100 p-1.5 text-sm text-violet-600 active:scale-95"
                  >
                    🔊
                  </button>
                </div>
                <p className="font-mono text-sm text-gray-400">{w.ipa}</p>
                {w.ru !== card.prompt && <p className="text-xs text-gray-500">{w.ru}</p>}
                <div className="rounded-2xl bg-gray-50 px-4 py-2 text-center">
                  <p className="text-sm text-gray-700 italic">{w.example_en}</p>
                  <p className="text-xs text-gray-500">{w.example_ru}</p>
                </div>
              </div>
            ))}
            {card.harder.length > 0 && (
              <p className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs text-gray-400">
                Сложнее (позже): <WordChips words={card.harder} />
              </p>
            )}
          </div>
        )}
      </div>

      {!revealed && (
        <button
          type="button"
          onClick={onReveal}
          className="w-full rounded-2xl bg-violet-600 py-4 text-lg font-semibold text-white active:scale-[0.98]"
        >
          Показать ответ
        </button>
      )}
    </div>
  );
}
