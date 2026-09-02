import { useProject } from "@/components/page-utils";
import { Button } from "@/components/Button";

export default function CaptionsPage() {
  const project = useProject();
  if (!project) return null;
  const scene = project.scenes[0];
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Closed Captions</h1>
      <p className="mt-1 text-sm text-ink-500">Create accessible text captions for each scene and dialogue sequence.</p>
      <p className="mt-1 text-xs text-ink-400">This is a text-writing feature, not video subtitle production.</p>
      {scene ? (
        <div className="mt-6 space-y-2">
          {scene.captions.map((c) => (
            <div key={c.id} className="flex items-start gap-3 rounded-md border border-ink-100 p-3">
              <span className="text-xs font-semibold text-ink-400">Caption {String(c.order).padStart(2, "0")}</span>
              <span className="text-sm text-ink-700">{c.text || "—"}</span>
            </div>
          ))}
          {scene.captions.length === 0 && (
            <div className="rounded-md border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
              No captions yet.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-md border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
          No scenes yet. Create a scene first.
        </div>
      )}
      <div className="mt-4">
        <Button variant="secondary">Generate captions</Button>
      </div>
    </div>
  );
}