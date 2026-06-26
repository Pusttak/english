import { useState } from "react";
import { BottomNav, type Tab } from "./components/BottomNav";
import { StudyView } from "./views/StudyView";
import { WordsView } from "./views/WordsView";
import { StatsView } from "./views/StatsView";
import { useProgress } from "./hooks/useProgress";

function App() {
  const [tab, setTab] = useState<Tab>("study");
  const progressApi = useProgress();

  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-gray-50">
      <header className="flex shrink-0 items-center justify-center border-b border-gray-200 bg-white py-3">
        <h1 className="text-lg font-bold text-gray-900">Oxford 1000 · English</h1>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto pt-4">
        {tab === "study" && <StudyView progressApi={progressApi} />}
        {tab === "words" && <WordsView progressApi={progressApi} />}
        {tab === "stats" && <StatsView progressApi={progressApi} />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default App;
