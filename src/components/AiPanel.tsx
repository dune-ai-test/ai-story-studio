import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { tauri } from "@/lib/tauri";
import { Project } from "@/lib/models";

const GENERATION_STATES = [
  "Reading story context…",
  "Checking character details…",
  "Developing scene…",
  "Writing dialogue…",
  "Checking continuity…",
];

export default function AiPanel() {
  const open = useAppStore((s) => s.aiPanelOpen);
  const project = useAppStore((s) => s.project) as Project | null;
  const aiWorking = useAppStore((s) => s.aiWorking);
  const aiAgent = useAppStore((s) => s.aiAgent);
  const aiSummary = useAppStore((s) => s.aiSummary);
  const toggle = useAppStore((s) => s.toggleAiPanel);
  const [stateText, setStateText] = useState(GENERATION_STATES[0]);

  // Cycle through generation states while working.
  useEffect(() => {
    if (!aiWorking) return;
    let i = 0;
    setStateText(GENERATION_STATES[0]);
    const id = setInterval(() => {
      i = (i + 1) % GENERATION_STATES.length;
      setStateText(GENERATION_STATES[i]);
    }, 1400);
    return () => clearInterval(id);
  }, [aiWorking]);

  if (!open) return null;

  return (
    <aside className="fixed right-0 top-0 z-30 flex h-screen w-[340px] flex-col border-l border-ink-100 bg-surface">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M12 2l2.4 2.4 3-.3-.3 3L20 12l-2.4 2.4.3 3-3-.3L12 22l-2.4-2.4-3 .3.3-3L4 12l2.4-2.4-.3-3 3 .3z" />
          </svg>
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <button
          onClick={() => toggle()}
          className="rounded-md p-1 text-ink-500 hover:bg-ink-50"
          aria-label="Close AI panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {aiWorking ? (
          <WorkingState text={stateText} agent={aiAgent} />
        ) : project ? (
          <Suggestions project={project} />
        ) : (
          <EmptyState />
        )}
      </div>
    </aside>
  );
}

function WorkingState({ text, agent }: { text: string; agent: string | null }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
        <svg className="h-5 w-5 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-ink-900">{agent ?? "Agent"}</p>
      <p className="mt-1 text-xs text-ink-500">{text}</p>
      <p className="mt-3 text-[11px] text-ink-400">
        No fake percentages — this is a best-effort status.
      </p>
    </div>
  );
}

function Suggestions({ project }: { project: Project }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-ink-100 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Story Agent
        </div>
        <p className="mt-1 text-sm text-ink-700">
          Working with "{project.title}". I noticed the premise could be sharper —
          it helps to state the central question up front.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Review", "Rewrite", "Explain", "Ignore"].map((a) => (
            <button
              key={a}
              className="rounded-md border border-ink-200 px-2 py-1 text-xs hover:bg-ink-50"
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-ink-100 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Editor Agent
        </div>
        <p className="mt-1 text-sm text-ink-700">
          Found a possible continuity issue. Daniel is described as 28 in Scene 2
          but 31 in Scene 8.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Fix Issue", "Edit manually", "Ignore"].map((a) => (
            <button
              key={a}
              className="rounded-md border border-ink-200 px-2 py-1 text-xs hover:bg-ink-50"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-400">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 2.4 3-.3-.3 3L20 12l-2.4 2.4.3 3-3-.3L12 22l-2.4-2.4-3 .3.3-3L4 12l2.4-2.4-.3-3 3 .3z" />
        </svg>
      </div>
      <p className="text-sm text-ink-500">No project selected.</p>
      <p className="mt-1 text-xs text-ink-400">Create a project to see agent suggestions here.</p>
    </div>
  );
}