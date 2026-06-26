export type Tab = "study" | "words" | "stats";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "study", label: "Учиться", icon: "🎯" },
  { id: "words", label: "Слова", icon: "📖" },
  { id: "stats", label: "Прогресс", icon: "📊" },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="flex shrink-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
            active === t.id ? "text-violet-600" : "text-gray-400"
          }`}
        >
          <span className="text-xl leading-none">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
