import { useMemo, useState } from "react";
import words from "../data/words.json";
import type { CefrLevel, Word, WordStatus } from "../types";
import { speak } from "../lib/speech";
import { LEVEL_COLORS, STATUS_COLORS, STATUS_LABELS } from "../lib/ui";
import type { useProgress } from "../hooks/useProgress";

const WORDS = words as Word[];

const LEVEL_FILTERS: ("all" | CefrLevel)[] = ["all", "A1", "A2"];
const STATUS_FILTERS: ("all" | WordStatus)[] = ["all", "new", "learning", "review", "learned"];

interface Props {
  progressApi: ReturnType<typeof useProgress>;
}

export function WordsView({ progressApi }: Props) {
  const { progress, getProgress, toggleLearned } = progressApi;
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | CefrLevel>("all");
  const [status, setStatus] = useState<"all" | WordStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORDS.filter((w) => {
      if (level !== "all" && w.level !== level) return false;
      const st = getProgress(w.id).status;
      if (status !== "all" && st !== status) return false;
      if (q && !w.word.toLowerCase().includes(q) && !w.ru.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, level, status, progress, getProgress]);

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск слова или перевода…"
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {LEVEL_FILTERS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              level === l ? "bg-violet-600 text-white" : "bg-white text-gray-500"
            }`}
          >
            {l === "all" ? "Все уровни" : l}
          </button>
        ))}
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === s ? "bg-violet-600 text-white" : "bg-white text-gray-500"
            }`}
          >
            {s === "all" ? "Все статусы" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">{filtered.length} слов</p>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {filtered.map((w) => {
          const st = getProgress(w.id).status;
          const expanded = expandedId === w.id;
          return (
            <div key={w.id} className="rounded-2xl bg-white p-3 shadow-sm">
              <button
                type="button"
                className="flex w-full items-center gap-2 text-left"
                onClick={() => setExpandedId(expanded ? null : w.id)}
              >
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEVEL_COLORS[w.level]}`}>
                  {w.level}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{w.word}</p>
                  <p className="text-sm text-gray-500">{w.ru}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_COLORS[st]}`}>
                  {STATUS_LABELS[st]}
                </span>
              </button>

              {expanded && (
                <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-gray-400">{w.ipa}</p>
                    <button
                      type="button"
                      onClick={() => speak(w.word)}
                      className="rounded-full bg-violet-100 px-2 py-1 text-xs text-violet-600"
                    >
                      🔊
                    </button>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-sm italic text-gray-700">{w.example_en}</p>
                    <p className="mt-1 text-xs text-gray-500">{w.example_ru}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLearned(w.id)}
                    className={`rounded-xl py-2 text-sm font-semibold ${
                      st === "learned"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {st === "learned" ? "Сбросить прогресс" : "Отметить как изученное"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
