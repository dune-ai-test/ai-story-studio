import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

const WORKSPACE: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Story", page: "story" },
  { label: "Characters", page: "characters" },
  { label: "Scenes", page: "scenes" },
  { label: "Dialogue", page: "dialogue" },
  { label: "Captions", page: "captions" },
  { label: "Draft", page: "draft" },
  { label: "Review", page: "review" },
];

const PROJECT: { label: string; page: Page }[] = [
  { label: "Versions", page: "home" },
  { label: "Activity", page: "home" },
  { label: "Settings", page: "home" },
];

export default function Sidebar() {
  const page = useAppStore((s) => s.page);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const navigate = useAppStore((s) => s.navigate);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  // On small screens, collapse the sidebar by default.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) toggleSidebar(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [toggleSidebar]);

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[256px] flex-col border-r border-ink-100 bg-surface">
      <div className="flex h-14 items-center px-4">
        <span className="text-base font-semibold tracking-tight text-ink-900">
          StoryStudio
        </span>
      </div>

      <div className="border-y border-ink-100 px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Project
        </div>
        <div className="mt-1 truncate text-sm font-medium text-ink-900">
          The Last Photograph
        </div>
        <div className="mt-0.5 text-xs text-ink-500">Mystery · Long-form · 8 scenes</div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-ink-400">
          Workspace
        </div>
        {WORKSPACE.map((item) => (
          <button
            key={item.page}
            onClick={() => navigate(item.page)}
            className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
              page === item.page
                ? "bg-accent-soft text-accent"
                : "text-ink-700 hover:bg-ink-50"
            }`}
          >
            {item.label}
          </button>
        ))}

        <div className="mt-4 mb-2 px-2 text-xs font-medium uppercase tracking-wide text-ink-400">
          Project
        </div>
        {PROJECT.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.page)}
            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-2">
        {["Help", "Account"].map((label) => (
          <button
            key={label}
            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50"
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}