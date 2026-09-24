import words from "../data/words.json";
import overrides from "../data/concept-overrides.json";
import type { CefrLevel, ProgressMap, Word } from "../types";
import { todayISO } from "./srs";

const WORDS = words as Word[];
const SOLO = new Set<string>(overrides.solo);

export const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2"];
const LEVEL_RANK: Record<CefrLevel, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };

/**
 * Одна карточка обратного режима: русский смысл + английские слова одного уровня.
 * Слова с одинаковым русским значением образуют «концепт»; внутри концепта карточки
 * идут по уровням (A1 → B2), а каждая следующая открывается после предыдущей.
 */
export interface ReverseCard {
  id: string;
  conceptId: string;
  level: CefrLevel;
  prompt: string;
  pos: string;
  words: Word[];
  easier: Word[];
  harder: Word[];
}

export interface Concept {
  id: string;
  cards: ReverseCard[]; // по возрастанию уровня
}

function firstSense(ru: string): string {
  return ru.split(/[;,]/)[0].trim();
}

function primaryPos(pos: string): string {
  return pos.split(",")[0].trim();
}

function buildConcepts(): Concept[] {
  const groups = new Map<string, Word[]>();
  for (const w of WORDS) {
    const key = SOLO.has(w.id) ? `w:${w.id}` : `${firstSense(w.ru).toLowerCase()}|${primaryPos(w.pos)}`;
    const list = groups.get(key);
    if (list) list.push(w);
    else groups.set(key, [w]);
  }

  const concepts: Concept[] = [];
  for (const [id, group] of groups) {
    const tiers = new Map<CefrLevel, Word[]>();
    for (const w of group) {
      const list = tiers.get(w.level);
      if (list) list.push(w);
      else tiers.set(w.level, [w]);
    }
    const levels = [...tiers.keys()].sort((a, b) => LEVEL_RANK[a] - LEVEL_RANK[b]);
    const cards = levels.map((level, i): ReverseCard => {
      const tierWords = tiers.get(level)!;
      return {
        id: `${id}:${level}`,
        conceptId: id,
        level,
        // у одиночного слова показываем перевод целиком, у группы — общий смысл
        prompt: group.length === 1 ? tierWords[0].ru : firstSense(tierWords[0].ru),
        pos: tierWords[0].pos,
        words: tierWords,
        easier: levels.slice(0, i).flatMap((l) => tiers.get(l)!),
        harder: levels.slice(i + 1).flatMap((l) => tiers.get(l)!),
      };
    });
    concepts.push({ id, cards });
  }
  return concepts;
}

export const CONCEPTS: Concept[] = buildConcepts();
export const REVERSE_CARDS: ReverseCard[] = CONCEPTS.flatMap((c) => c.cards);

export interface ReverseQueueItem {
  card: ReverseCard;
  isNew: boolean;
}

function isIntroduced(progress: ProgressMap, id: string): boolean {
  const p = progress[id];
  return !!p && (p.reps >= 1 || p.status === "learned");
}

/**
 * Очередь: сначала карточки к повторению, затем новые (сначала простые уровни).
 * Новая карточка старшего уровня открывается, когда пройдена предыдущая
 * карточка того же смысла среди выбранных уровней.
 */
export function buildReverseQueue(
  progress: ProgressMap,
  levels: ReadonlySet<CefrLevel>,
  newRemaining: number,
): ReverseQueueItem[] {
  const today = todayISO();
  const due: ReverseQueueItem[] = [];
  const fresh: ReverseQueueItem[] = [];

  for (const concept of CONCEPTS) {
    let prev: ReverseCard | null = null;
    for (const card of concept.cards) {
      if (!levels.has(card.level)) continue;
      const p = progress[card.id];
      if (!p || p.status === "new") {
        if (prev === null || isIntroduced(progress, prev.id)) fresh.push({ card, isNew: true });
      } else if (p.status !== "learned" && p.due <= today) {
        due.push({ card, isNew: false });
      }
      prev = card;
    }
  }

  fresh.sort((a, b) => LEVEL_RANK[a.card.level] - LEVEL_RANK[b.card.level]);
  return [...due, ...fresh.slice(0, Math.max(0, newRemaining))];
}
