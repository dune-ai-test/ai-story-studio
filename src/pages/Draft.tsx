import { useProject } from "@/components/page-utils";
import { Button } from "@/components/Button";

export default function DraftPage() {
  const project = useProject();
  if (!project) return null;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Draft</h1>
          <p className="mt-1 text-sm text-ink-500">The complete manuscript as one continuous document.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Save</Button>
          <Button variant="secondary">Version history</Button>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-4">
        {[
          ["Words", "0"],
          ["Reading time", "0 min"],
          ["Scenes", String(project.scenes.length)],
          ["Characters", String(project.characters.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-ink-100 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</div>
            <div className="mt-1 text-lg font-medium text-ink-900">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-md border border-ink-100 bg-surface p-6 editorial">
        <h2 className="text-xl font-medium text-ink-900">{project.title}</h2>
        {project.scenes.map((s) => (
          <div key={s.id} className="mt-4">
            <h3 className="text-base font-semibold text-ink-900">Scene {s.number}: {s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-700">{s.writing || "—"}</p>
          </div>
        ))}
        {project.scenes.length === 0 && (
          <p className="text-sm text-ink-400">No scenes yet.</p>
        )}
      </div>
    </div>
  );
}