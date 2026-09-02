import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/Button";

export default function ScenesPage() {
  const project = useAppStore((s) => s.project);
  const setProject = useAppStore((s) => s.setProject);
  const autosave = useAppStore((s) => s.autosave);
  const navigate = useAppStore((s) => s.navigate);
  const pushToast = useAppStore((s) => s.pushToast);
  const [selected, setSelected] = useState<string | null>(project?.scenes[0]?.id ?? null);

  if (!project) return null;

  function reorder(from: number, to: number) {
    const scenes = [...project.scenes];
    const [moved] = scenes.splice(from, 1);
    scenes.splice(to, 0, moved);
    const updated = scenes.map((s, i) => ({ ...s, number: i + 1 }));
    const proj = { ...project, scenes: updated };
    setProject(proj);
    autosave(proj);
  }

  function addScene() {
    const id = crypto.randomUUID();
    const updated = {
      ...project,
      scenes: [...project.scenes, { id, number: project.scenes.length + 1, title: `Scene ${project.scenes.length + 1}`, location: null, time: null, characters: [], purpose: null, conflict: null, mood: null, story_beat: null, writing: "", dialogue: [], captions: [], status: "NotStarted" }],
    };
    setProject(updated);
    autosave(updated);
    setSelected(id);
  }

  function updateScene(id: string, field: string, value: any) {
    const updated = {
      ...project,
      scenes: project.scenes.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    };
    setProject(updated);
    autosave(updated);
  }

  function deleteScene(id: string) {
    const updated = {
      ...project,
      scenes: project.scenes.filter((s) => s.id !== id).map((s, i) => ({ ...s, number: i + 1 })),
    };
    setProject(updated);
    autosave(updated);
    setSelected(null);
  }

  function duplicateScene(id: string) {
    const src = project.scenes.find((s) => s.id === id)!;
    const copy = { ...src, id: crypto.randomUUID(), number: project.scenes.length + 1, title: `${src.title} (copy)` };
    const updated = { ...project, scenes: [...project.scenes, copy].map((s, i) => ({ ...s, number: i + 1 })) };
    setProject(updated);
    autosave(updated);
    pushToast({ type: "success", message: "Scene duplicated." });
  }

  const selectedScene = project.scenes.find((s) => s.id === selected);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Build your scenes</h1>
          <p className="mt-1 text-sm text-ink-500">Break the story into structured scenes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={addScene}>+ Add Scene</Button>
          <Button variant="secondary" onClick={() => pushToast({ type: "info", message: "Scene Agent — coming soon with an LLM key." })}>Develop Scene</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 rounded-md border border-ink-100">
          <div className="border-b border-ink-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Scenes ({project.scenes.length})
          </div>
          <div className="p-1">
            {project.scenes.map((s, i) => (
              <SceneRow
                key={s.id}
                scene={s}
                selected={selected === s.id}
                onSel={() => setSelected(s.id)}
                onUp={() => i > 0 && reorder(i, i - 1)}
                onDown={() => i < project.scenes.length - 1 && reorder(i, i + 1)}
                onDup={() => duplicateScene(s.id)}
                onDelete={() => deleteScene(s.id)}
              />
            ))}
            {project.scenes.length === 0 && (
              <div className="p-4 text-center text-xs text-ink-400">No scenes yet.</div>
            )}
          </div>
        </div>

        <div className="col-span-3">
          {selectedScene ? (
            <SceneEditor scene={selectedScene} onChange={(f, v) => updateScene(selectedScene.id, f, v)} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-md border border-dashed border-ink-200 p-12 text-center text-sm text-ink-400">
              Select a scene or add a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SceneRow({
  scene, selected, onSel, onUp, onDown, onDup, onDelete,
}: {
  scene: any; selected: boolean; onSel: () => void; onUp: () => void; onDown: () => void; onDup: () => void; onDelete: () => void;
}) {
  return (
    <div className={`rounded-md px-2 py-1.5 hover:bg-ink-50 ${selected ? "bg-accent-soft" : ""}`}>
      <div className="flex items-center gap-1">
        <span className="text-xs text-ink-400">Scene {scene.number}</span>
        <button onClick={onSel} className="flex-1 text-left text-sm text-ink-700 hover:text-ink-900">
          {scene.title}
        </button>
      </div>
      <div className="mt-1 flex items-center gap-1">
        <button onClick={onUp} className="rounded border border-ink-200 px-1 py-0.5 text-xs text-ink-500 hover:bg-ink-50">▲</button>
        <button onClick={onDown} className="rounded border border-ink-200 px-1 py-0.5 text-xs text-ink-500 hover:bg-ink-50">▼</button>
        <button onClick={onDup} className="rounded border border-ink-200 px-1 py-0.5 text-xs text-ink-500 hover:bg-ink-50">Duplicate</button>
        <button onClick={onDelete} className="ml-auto rounded border border-ink-200 px-1 py-0.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
      </div>
    </div>
  );
}

function SceneEditor({ scene, onChange }: { scene: any; onChange: (f: string, v: any) => void }) {
  return (
    <div className="rounded-md border border-ink-100 p-4">
      <input
        value={scene.title}
        onChange={(e) => onChange("title", e.target.value)}
        className="w-full bg-transparent text-lg font-semibold text-ink-900 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
          ["location", "Location"], ["time", "Time"], ["mood", "Mood"],
          ["purpose", "Purpose"], ["conflict", "Conflict"], ["story_beat", "Story beat"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-ink-500">{label}</label>
            <input
              value={(scene as any)[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </div>
        ))}
      </div>
      <div className="mt-3">
        <label className="block text-xs font-medium text-ink-500">Status</label>
        <select
          value={scene.status}
          onChange={(e) => onChange("status", e.target.value)}
          className="mt-1 w-full rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="NotStarted">Not Started</option>
          <option value="InProgress">In Progress</option>
          <option value="NeedsReview">Needs Review</option>
          <option value="Draft">Draft</option>
          <option value="Complete">Complete</option>
        </select>
      </div>
    </div>
  );
}