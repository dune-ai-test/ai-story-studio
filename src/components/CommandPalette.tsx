import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

const ACTIONS = [
  { label: "Go to Home", page: "home" as const, keywords: "home dashboard" },
  { label: "Go to Story", page: "story" as const, keywords: "story premise theme" },
  { label: "Go to Characters", page: "characters" as const, keywords: "characters cast" },
  { label: "Go to Scenes", page: "scenes" as const, keywords: "scenes structure" },
  { label: "Go to Dialogue", page: "dialogue" as const, keywords: "dialogue conversation" },
  { label: "Go to Captions", page: "captions" as const, keywords: "captions accessibility" },
  { label: "Go to Draft", page: "draft" as const, keywords: "draft manuscript" },
  { label: "Go to Review", page: "review" as const, keywords: "review editor check" },
  { label: "Go to Export", page: "export" as const, keywords: "export word pdf download" },
];

export default function CommandPalette() {
  const open = useAppStore((s) => s.commandOpen);
  const close = useAppStore((s) => s.closeCommand);
  const navigate = useAppStore((s) => s.navigate);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 p-4 pt-[18vh]"
      onClick={close}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-ink-200 bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-ink-100 px-3 py-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            autoFocus
            placeholder="Search pages and actions…"
            className="flex-1 border-0 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => { navigate(a.page); close(); }}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-ink-50"
            >
              <span>{a.label}</span>
              <span className="text-xs text-ink-400">{a.keywords}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}