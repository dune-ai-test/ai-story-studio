import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/Button";

const SECTIONS = [
  { key: "premise", label: "Premise" },
  { key: "theme", label: "Theme" },
  { key: "conflict", label: "Conflict" },
  { key: "setting", label: "Setting" },
] as const;

const ARCS = [
  { key: "beginning", label: "Beginning" },
  { key: "rising_action", label: "Rising Action" },
  { key: "turning_point", label: "Turning Point" },
  { key: "climax", label: "Climax" },
  { key: "resolution", label: "Resolution" },
] as const;

export default function StoryPage() {
  const project = useAppStore((s) => s.project);
  const setProject = useAppStore((s) => s.setProject);
  const navigate = useAppStore((s) => s.navigate);
  const autosave = useAppStore((s) => s.autosave);
  const pushToast = useAppStore((s) => s.pushToast);

  if (!project) return null;

  function update(field: string, value: string) {
    const updated = { ...project, [field]: value };
    setProject(updated);
    autosave(updated);
  }

  function applyAi(label: string, field: string, value: string) {
    update(field, value);
    pushToast({ type: "success", message: `${label} updated ${field}.` });
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Shape the story</h1>
          <p className="mt-1 text-sm text-ink-500">The Story Agent develops the initial concept. Everything is editable.</p>
        </div>
        <Button variant="primary" onClick={() => navigate("characters")}>Continue to Characters</Button>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <EditableSection
            key={s.key}
            label={s.label}
            value={(project as any)[s.key] ?? ""}
            onChange={(v) => update(s.key, v)}
            onAi={applyAi}
          />
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Story Arc</div>
        <div className="space-y-2">
          {ARCS.map((a) => (
            <EditableSection
              key={a.key}
              label={a.label}
              value={(project.story_arc as any)[a.key] ?? ""}
              onChange={(v) => {
                const updated = {
                  ...project,
                  story_arc: { ...project.story_arc, [a.key]: v },
                };
                setProject(updated);
                autosave(updated);
              }}
              onAi={applyAi}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["Regenerate", "Expand", "Rewrite", "Make darker", "Make lighter", "Make more emotional", "Make more realistic"].map((a) => (
          <button key={a} onClick={() => pushToast({ type: "info", message: `${a} — coming soon with an LLM key.` })} className="rounded-md border border-ink-200 px-2 py-1 text-xs text-ink-600 hover:bg-ink-50">
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

function EditableSection({
  label, value, onChange, onAi,
}: {
  label: string; value: string; onChange: (v: string) => void; onAi: (label: string, field: string, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="rounded-md border border-ink-100 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-ink-900">{label}</div>
        <div className="flex gap-1">
          <button onClick={() => setEditing(!editing)} className="rounded-md border border-ink-200 px-2 py-0.5 text-xs text-ink-600 hover:bg-ink-50">
            {editing ? "Done" : "Edit"}
          </button>
          <button onClick={() => onAi("Story Agent", label, value || sampleFor(label))} className="rounded-md border border-ink-200 px-2 py-0.5 text-xs text-ink-600 hover:bg-ink-50">
            Regenerate
          </button>
        </div>
      </div>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-2 w-full resize-y rounded-md border border-ink-200 bg-surface p-2 text-sm outline-none focus:border-accent"
        />
      ) : (
        <p className="mt-1 text-sm text-ink-700">{value || sampleFor(label)}</p>
      )}
    </div>
  );
}

function sampleFor(label: string): string {
  const s: Record<string, string> = {
    Premise: "A detective returns to her hometown after twenty years and discovers that her childhood friend disappeared under mysterious circumstances.",
    Theme: "The weight of secrets we keep from the people we love.",
    Conflict: "Maya must decide whether to dig up the past or let it stay buried.",
    Setting: "A coastal town in New England, autumn, present day.",
    Beginning: "Maya returns home and finds the town changed.",
    "Rising Action": "She uncovers clues about her friend's disappearance.",
    "Turning Point": "She learns Daniel has been hiding a photograph.",
    Climax: "Confrontation in the attic.",
    Resolution: "The truth comes out, and the town begins to heal.",
  };
  return s[label] ?? "";
}