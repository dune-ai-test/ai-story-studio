import { useAppStore } from "@/lib/store";

export default function Topbar() {
  const page = useAppStore((s) => s.page);
  const saveState = useAppStore((s) => s.saveState);
  const saveMessage = useAppStore((s) => s.saveMessage);
  const aiWorking = useAppStore((s) => s.aiWorking);
  const aiAgent = useAppStore((s) => s.aiAgent);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleAiPanel = useAppStore((s) => s.toggleAiPanel);
  const openCommand = useAppStore((s) => s.openCommand);

  const titles: Record<string, string> = {
    home: "Home",
    topic: "Topic",
    story: "Story",
    characters: "Characters",
    scenes: "Scenes",
    dialogue: "Dialogue",
    captions: "Captions",
    draft: "Draft",
    review: "Review",
    export: "Export",
  };

  const saveLabel =
    saveState === "saving" ? "Saving…" :
    saveState === "saved" ? "Saved just now" :
    saveState === "error" ? saveMessage ?? "Couldn't save" :
    "Saved";

  const saveColor =
    saveState === "saving" ? "text-ink-500" :
    saveState === "error" ? "text-accent" :
    "text-ink-600";

  return (
    <header className="fixed left-0 top-0 z-20 flex h-14 w-full items-center gap-3 border-b border-ink-100 bg-surface/95 px-4 backdrop-blur">
      <button
        onClick={() => toggleSidebar()}
        className="rounded-md p-1.5 text-ink-600 hover:bg-ink-50 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <MenuIcon />
      </button>

      <div className="flex items-center gap-1.5 text-sm text-ink-500">
        <span className="hover:text-ink-900">The Last Photograph</span>
        <Chevron /> <span className="font-medium text-ink-900">{titles[page] ?? page}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {aiWorking && (
          <div className="hidden items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent sm:flex">
            <Spinner /> {aiAgent ?? "Working"}…
          </div>
        )}
        <span className={`hidden text-xs ${saveColor} sm:inline`}>{saveLabel}</span>
        <button
          onClick={openCommand}
          className="hidden items-center gap-1.5 rounded-md border border-ink-200 px-2.5 py-1 text-xs text-ink-500 hover:bg-ink-50 sm:flex"
        >
          <SearchIcon /> Search <kbd className="ml-1 rounded border border-ink-200 px-1 text-[10px]">⌘K</kbd>
        </button>
        <button
          onClick={() => toggleAiPanel()}
          className="rounded-md p-1.5 text-ink-600 hover:bg-ink-50"
          aria-label="Toggle AI assistant"
        >
          <SparkIcon />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-xs font-medium text-ink-700">
          AL
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 2.4 3-.3-.3 3L20 12l-2.4 2.4.3 3-3-.3L12 22l-2.4-2.4-3 .3.3-3L4 12l2.4-2.4-.3-3 3 .3z" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}