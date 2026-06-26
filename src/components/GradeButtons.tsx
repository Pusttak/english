import type { Grade } from "../types";

interface Props {
  onGrade: (grade: Grade) => void;
}

const BUTTONS: { grade: Grade; label: string; sub: string; classes: string }[] = [
  { grade: "again", label: "Не помню", sub: "снова", classes: "bg-rose-500 active:bg-rose-600" },
  { grade: "hard", label: "Сложно", sub: "скоро", classes: "bg-amber-500 active:bg-amber-600" },
  { grade: "good", label: "Хорошо", sub: "норм", classes: "bg-sky-500 active:bg-sky-600" },
  { grade: "easy", label: "Легко", sub: "надолго", classes: "bg-emerald-500 active:bg-emerald-600" },
];

export function GradeButtons({ onGrade }: Props) {
  return (
    <div className="grid w-full grid-cols-4 gap-2">
      {BUTTONS.map((b) => (
        <button
          key={b.grade}
          type="button"
          onClick={() => onGrade(b.grade)}
          className={`flex flex-col items-center rounded-2xl py-3 text-white active:scale-[0.97] ${b.classes}`}
        >
          <span className="text-sm font-semibold">{b.label}</span>
          <span className="text-[11px] opacity-80">{b.sub}</span>
        </button>
      ))}
    </div>
  );
}
