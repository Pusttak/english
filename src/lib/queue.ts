import type { ProgressMap, Word } from "../types";
import { todayISO } from "./srs";

export interface QueueItem {
  word: Word;
  isNew: boolean;
}

export function buildQueue(
  words: Word[],
  progress: ProgressMap,
  newWordsRemaining: number,
): QueueItem[] {
  const today = todayISO();
  const due: QueueItem[] = [];
  const fresh: QueueItem[] = [];

  for (const word of words) {
    const p = progress[word.id];
    if (!p || p.status === "new") {
      if (fresh.length < Math.max(0, newWordsRemaining)) {
        fresh.push({ word, isNew: true });
      }
      continue;
    }
    if (p.status !== "learned" && p.due <= today) {
      due.push({ word, isNew: false });
    }
  }

  return [...due, ...fresh];
}
