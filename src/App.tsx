import { useState } from "react";
import { BottomNav, type Tab } from "./components/BottomNav";
import { StudyView } from "./views/StudyView";
import { ReverseView } from "./views/ReverseView";
import { WordsView } from "./views/WordsView";
import { StatsView } from "./views/StatsView";
import { useProgress } from "./hooks/useProgress";
import { RU_EN_KEYS } from "./lib/storage";

function App() {
  const [tab, setTab] = useState<Tab>("study");
  const progressApi = useProgress();
  const reverseApi = useProgress(RU_EN_KEYS);

  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-gray-50">
      <header className="flex shrink-0 items-center justify-center border-b border-gray-200 bg-white py-3">
        <h1 className="text-lg font-bold text-gray-900">Oxford 3000 · English</h1>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto pt-4">
        {tab === "study" && <StudyView progressApi={progressApi} />}
        {tab === "reverse" && <ReverseView progressApi={reverseApi} />}
        {tab === "words" && <WordsView progressApi={progressApi} />}
        {tab === "stats" && <StatsView progressApi={progressApi} reverseApi={reverseApi} />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default App;
