import { useState } from "react";
import type { ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/Button";

export default function TopicPage() {
  const create = useAppStore((s) => s.createProject);
  const create = useAppStore((s) => s.createProject);
  const navigate = useAppStore((s) => s.navigate);
  const [text, setText] = useState(
    "A detective returns to her hometown after twenty years and discovers that her childhood friend disappeared under mysterious circumstances."
  );
  const [genre, setGenre] = useState("Mystery");
  const [tone, setTone] = useState("Tense");
  const [length, setLength] = useState("Long-form");
  const [audience, setAudience] = useState("Adult");
  const [pov, setPov] = useState("First person");

  async function onCreate() {
    const project = await create("The Last Photograph");
    // Stash the topic + controls onto the project for the Story Agent.
    const { tauri } = await import("@/lib/tauri");
    const updated = {
      ...project,
      title: "The Last Photograph",
      topic: text,
      genre,
      tone,
      length,
      audience,
      point_of_view: pov,
    };
    await tauri.saveProject(updated);
    useAppStore.getState().setProject(updated);
    navigate("story");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">What story do you want to write?</h1>
      <p className="mt-1 text-sm text-ink-500">
        Start with a topic, character, conflict, memory, or even a single sentence.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="mt-4 w-full resize-y rounded-md border border-ink-200 bg-surface p-3 text-sm leading-relaxed outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label="Tone">
          <select value={tone} onChange={(e) => setTone(e.target.value)} className={sel}>
            {["Tense", "Wistful", "Dark", "Hopeful", "Suspenseful", "Intimate"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Genre">
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className={sel}>
            {["Mystery", "Thriller", "Romance", "Fantasy", "Sci-Fi", "Horror", "Literary", "Comedy"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="Length">
          <select value={length} onChange={(e) => setLength(e.target.value)} className={sel}>
            {["Short story", "Long-form", "Novella", "Novel"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Audience">
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className={sel}>
            {["Adult", "Young adult", "Children", "General"].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Point of view" className="col-span-2">
          <select value={pov} onChange={(e) => setPov(e.target.value)} className={sel}>
            {["First person", "Third person limited", "Third person omniscient", "Second person"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={onCreate}>Create Story</Button>
        <Button variant="secondary">Start from Outline</Button>
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Suggested ideas</div>
        <div className="mt-2 space-y-1.5">
          {[
            "A mystery in a forgotten seaside town.",
            "A romance between two rival architects.",
            "A child discovers a letter written 50 years in the future.",
          ].map((idea) => (
            <button
              key={idea}
              onClick={() => setText(idea)}
              className="block w-full rounded-md border border-ink-100 px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-ink-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const sel = "mt-1 w-full rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent";