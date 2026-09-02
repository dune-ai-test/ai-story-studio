import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/Button";
import { Project } from "@/lib/models";

const FIELDS = [
  ["name", "Name"], ["role", "Role"], ["age", "Age"], ["appearance", "Appearance"],
  ["personality", "Personality"], ["background", "Background"], ["motivation", "Motivation"],
  ["goal", "Goal"], ["fear", "Fear"], ["strengths", "Strengths"], ["weaknesses", "Weaknesses"],
  ["arc", "Character arc"],
] as const;

export default function CharactersPage() {
  const project = useAppStore((s) => s.project);
  const setProject = useAppStore((s) => s.setProject);
  const autosave = useAppStore((s) => s.autosave);
  const pushToast = useAppStore((s) => s.pushToast);
  const [selected, setSelected] = useState<string | null>(project?.characters[0]?.id ?? null);

  if (!project) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Build your characters</h1>
        <p className="mt-1 text-sm text-ink-500">Create and refine the cast.</p>
        <div className="mt-6 rounded-md border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
          No project selected.
        </div>
      </div>
    );
  }

  function addCharacter(p: Project) {
    const id = crypto.randomUUID();
    const updated = {
      ...p,
      characters: [...p.characters, { id, name: "New Character", role: null, age: null, appearance: null, personality: null, background: null, motivation: null, goal: null, fear: null, strengths: null, weaknesses: null, relationships: [], arc: null }],
    };
    setProject(updated);
    autosave(updated);
    setSelected(id);
  }

  function updateCharacter(p: Project, id: string, field: string, value: string) {
    const updated = {
      ...p,
      characters: p.characters.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    };
    setProject(updated);
    autosave(updated);
  }

  function deleteCharacter(p: Project, id: string) {
    const updated = {
      ...p,
      characters: p.characters.filter((c) => c.id !== id),
    };
    setProject(updated);
    autosave(updated);
    setSelected(null);
  }

  function duplicateCharacter(p: Project, id: string) {
    const src = p.characters.find((c) => c.id === id);
    if (!src) return;
    const copy = { ...src, id: crypto.randomUUID(), name: `${src.name} (copy)` };
    const updated = { ...p, characters: [...p.characters, copy] };
    setProject(updated);
    autosave(updated);
    pushToast({ type: "success", message: "Character duplicated." });
  }

  const selectedChar = project.characters.find((c) => c.id === selected);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Build your characters</h1>
          <p className="mt-1 text-sm text-ink-500">Create and refine the cast.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => addCharacter(project)}>+ Add Character</Button>
          <Button variant="secondary" onClick={() => pushToast({ type: "info", message: "Character Agent suggestions — coming soon with an LLM key." })}>Suggest Characters</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 rounded-md border border-ink-100">
          <div className="border-b border-ink-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Cast ({project.characters.length})
          </div>
          <div className="p-1">
            {project.characters.map((c) => (
              <div key={c.id} className="group flex items-center rounded-md hover:bg-ink-50">
                <button
                  onClick={() => setSelected(c.id)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-sm hover:bg-ink-50 ${
                    selected === c.id ? "bg-accent-soft text-accent" : "text-ink-700"
                  }`}
                >
                  <span>{c.name}</span>
                  {c.role && <span className="ml-2 text-xs text-ink-400">{c.role}</span>}
                </button>
                <button
                  onClick={() => duplicateCharacter(project, c.id)}
                  className="px-1 py-1.5 text-xs text-ink-400 opacity-0 group-hover:opacity-100 hover:text-ink-700"
                  title="Duplicate"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => deleteCharacter(project, c.id)}
                  className="px-1 py-1.5 text-xs text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-50"
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            ))}
            {project.characters.length === 0 && (
              <div className="p-4 text-center text-xs text-ink-400">No characters yet.</div>
            )}
          </div>
        </div>

        <div className="col-span-3">
          {selectedChar ? (
            <CharacterEditor
              character={selectedChar}
              onChange={(f, v) => updateCharacter(project, selectedChar.id, f, v)}
              onDelete={() => deleteCharacter(project, selectedChar.id)}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-md border border-dashed border-ink-200 p-12 text-center text-sm text-ink-400">
              Select a character or add a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CharacterEditor({
  character, onChange, onDelete,
}: {
  character: any; onChange: (f: string, v: string) => void; onDelete: () => void;
}) {
  return (
    <div className="rounded-md border border-ink-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <input
          value={character.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="w-full bg-transparent text-lg font-semibold text-ink-900 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <Button variant="ghost" onClick={onDelete} className="ml-2 text-red-600">Delete</Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.slice(1).map(([key, label]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-ink-500">{label}</label>
            <input
              value={(character as any)[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-ink-100 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Relationships</div>
        {character.relationships.length === 0 ? (
          <p className="mt-1 text-xs text-ink-400">No relationships yet.</p>
        ) : (
          <div className="mt-2 space-y-1">
            {character.relationships.map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-ink-900">↔</span>
                <span className="text-ink-700">{r.character_id}</span>
                <span className="text-ink-500">— {r.label}</span>
                {r.current && <span className="text-xs text-ink-400">({r.current})</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}