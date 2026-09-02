import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ToastContainer from "@/components/ToastContainer";
import CommandPalette from "@/components/CommandPalette";
import AiPanel from "@/components/AiPanel";

// Pages — each is a separate file built by a subagent.
import HomePage from "@/pages/Home";
import TopicPage from "@/pages/Topic";
import StoryPage from "@/pages/Story";
import CharactersPage from "@/pages/Characters";
import ScenesPage from "@/pages/Scenes";
import DialoguePage from "@/pages/Dialogue";
import CaptionsPage from "@/pages/Captions";
import DraftPage from "@/pages/Draft";
import ReviewPage from "@/pages/Review";
import ExportPage from "@/pages/Export";

export default function App() {
  const project = useAppStore((s) => s.project);
  const loading = useAppStore((s) => s.loading);
  const error = useAppStore((s) => s.error);
  const commandOpen = useAppStore((s) => s.commandOpen);

  // On first launch, seed a demo project so the UI is immediately usable.
  useEffect(() => {
    if (!project && !loading) {
      // No project yet — show the topic page as the entry point.
    }
  }, [project, loading]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-ink-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-content px-6 py-6">
            {loading ? (
              <Skeleton />
            ) : error ? (
              <ErrorState message={error} />
            ) : (
              <PageRouter />
            )}
          </div>
        </main>
      </div>
      <AiPanel />
      <ToastContainer />
      {commandOpen && <CommandPalette />}
    </div>
  );
}

function PageRouter() {
  const page = useAppStore((s) => s.page);
  switch (page) {
    case "topic":
      return <TopicPage />;
    case "story":
      return <StoryPage />;
    case "characters":
      return <CharactersPage />;
    case "scenes":
      return <ScenesPage />;
    case "dialogue":
      return <DialoguePage />;
    case "captions":
      return <CaptionsPage />;
    case "draft":
      return <DraftPage />;
    case "review":
      return <ReviewPage />;
    case "export":
      return <ExportPage />;
    case "home":
    default:
      return <HomePage />;
  }
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded bg-ink-100" />
      <div className="h-4 w-72 rounded bg-ink-100" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 rounded-lg border border-ink-100 bg-surface" />
        <div className="h-24 rounded-lg border border-ink-100 bg-surface" />
        <div className="h-24 rounded-lg border border-ink-100 bg-surface" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      <strong className="block mb-1">Something went wrong.</strong>
      {message}
    </div>
  );
}