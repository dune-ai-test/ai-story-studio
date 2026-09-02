import { useProject } from "@/components/page-utils";
import { Button } from "@/components/Button";

export default function DialoguePage() {
  const project = useProject();
  if (!project) return null;
  const scene = project.scenes[0];
  if (!scene) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Dialogue</h1>
        <p className="mt-1 text-sm text-ink-500">Focus specifically on written dialogue.</p>
        <div className="mt-6 rounded-md border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
          No scenes yet. Create a scene first.
        </div>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Dialogue</h1>
      <p className="mt-1 text-sm text-ink-500">Scene {scene.number}: {scene.title}</p>
      <div className="mt-6 space-y-4">
        {scene.dialogue.map((d) => (
          <div key={d.id} className="rounded-md border border-ink-100 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-accent">{d.character_id}</div>
            <p className="mt-1 text-sm text-ink-700">{d.text || "—"}</p>
          </div>
        ))}
        {scene.dialogue.length === 0 && (
          <div className="rounded-md border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
            No dialogue yet.
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary">Make more natural</Button>
        <Button variant="secondary">Increase tension</Button>
        <Button variant="secondary">Add subtext</Button>
      </div>
    </div>
  );
}