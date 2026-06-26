export type CefrLevel = "A1" | "A2" | "B1" | "B2";

export interface Word {
  id: string;
  word: string;
  pos: string;
  level: CefrLevel;
  ru: string;
  ipa: string;
  example_en: string;
  example_ru: string;
}

export type WordStatus = "new" | "learning" | "review" | "learned";

export type Grade = "again" | "hard" | "good" | "easy";

export interface WordProgress {
  status: WordStatus;
  reps: number;
  ease: number;
  interval: number; // days
  due: string; // ISO date (yyyy-mm-dd)
  lastReviewed?: string; // ISO date
  lastGrade?: Grade;
}

export type ProgressMap = Record<string, WordProgress>;

export interface DailyLog {
  date: string; // yyyy-mm-dd
  reviews: number;
  correct: number;
  newWords: number;
}

export interface AppStats {
  log: Record<string, DailyLog>; // by date
  dailyNewGoal: number;
}
