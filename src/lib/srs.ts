import type { Grade, WordProgress, WordStatus } from "../types";

function formatLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return formatLocalISO(new Date());
}

export function addDays(dateISO: string, days: number): string {
  const [y, m, day] = dateISO.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  d.setDate(d.getDate() + days);
  return formatLocalISO(d);
}

export function createNewProgress(): WordProgress {
  return {
    status: "new",
    reps: 0,
    ease: 2.5,
    interval: 0,
    due: todayISO(),
  };
}

const LEARNED_INTERVAL_DAYS = 60;
const REVIEW_INTERVAL_DAYS = 21;

export function reviewWord(p: WordProgress, grade: Grade): WordProgress {
  const today = todayISO();
  let ease = p.ease;
  let interval = p.interval;
  let reps = p.reps;

  if (grade === "again") {
    ease = Math.max(1.3, ease - 0.2);
    return {
      ...p,
      ease,
      interval: 0,
      reps: 0,
      status: "learning",
      due: today,
      lastReviewed: today,
      lastGrade: grade,
    };
  }

  if (grade === "hard") {
    ease = Math.max(1.3, ease - 0.15);
    interval = interval === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
  } else if (grade === "good") {
    interval = interval === 0 ? 1 : Math.round(interval * ease);
  } else {
    ease = ease + 0.15;
    interval = interval === 0 ? 4 : Math.round(interval * ease * 1.3);
  }
  reps += 1;

  let status: WordStatus = "learning";
  if (interval >= LEARNED_INTERVAL_DAYS) status = "learned";
  else if (interval >= REVIEW_INTERVAL_DAYS) status = "review";

  return {
    ...p,
    ease,
    interval,
    reps,
    status,
    due: addDays(today, interval),
    lastReviewed: today,
    lastGrade: grade,
  };
}

export function markLearned(p: WordProgress): WordProgress {
  const today = todayISO();
  return {
    ...p,
    status: "learned",
    interval: Math.max(p.interval, LEARNED_INTERVAL_DAYS),
    due: addDays(today, LEARNED_INTERVAL_DAYS),
    lastReviewed: today,
  };
}

export function resetProgress(): WordProgress {
  return createNewProgress();
}

export function isDue(p: WordProgress, onDate: string): boolean {
  return p.due <= onDate;
}
