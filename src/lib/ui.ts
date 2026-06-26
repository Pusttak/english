import type { CefrLevel, WordStatus } from "../types";

export const LEVEL_COLORS: Record<CefrLevel, string> = {
  A1: "bg-emerald-100 text-emerald-700",
  A2: "bg-sky-100 text-sky-700",
  B1: "bg-amber-100 text-amber-700",
  B2: "bg-rose-100 text-rose-700",
};

export const STATUS_LABELS: Record<WordStatus, string> = {
  new: "Новое",
  learning: "Изучается",
  review: "Повторение",
  learned: "Изучено",
};

export const STATUS_COLORS: Record<WordStatus, string> = {
  new: "bg-gray-100 text-gray-500",
  learning: "bg-amber-100 text-amber-700",
  review: "bg-sky-100 text-sky-700",
  learned: "bg-emerald-100 text-emerald-700",
};
