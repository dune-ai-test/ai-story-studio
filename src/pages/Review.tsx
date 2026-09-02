import { useAppStore } from "@/lib/store";
import { Button } from "@/components/Button";

const SECTIONS = [
  { label: "Story Structure", status: "Good", note: null },
  { label: "Character Consistency", status: "Needs Review", note: "Daniel is described as 28 in Scene 2 and 31 in Scene 8." },
  { label: "Timeline", status: "Good", note: null },
  { label: "Dialogue", status: "Good", note: null },
  { label: "Pacing", status: "Needs Attention", note: "Scene 6 runs long; consider trimming the attic description." },
  { label: "Grammar", status: "3 issues", note: "3 repeated phrases found across the draft." },
];

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  Good: { bg: "#e7f3ec", fg: "#2f7d4f", label: "Good" },
  "Needs Review": { bg: "#fdf3e0", fg: "#b8860b", label: "Needs Review" },
  "Needs Attention": { bg: "#fdf3e0", fg: "#b8860b", label: "Needs Attention" },
};

export default function ReviewPage() {
  const project = useAppStore((s) => s.project);
  const pushToast = useAppStore((s) => s.pushToast);

  if (!project) return null;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Review your story</h1>
        <p className="mt-1 text-sm text-ink-500">The Editor Agent scans the manuscript. Instead of arbitrary scores, it explains actual problems.</p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const style = STATUS_STYLE[s.status] ?? STATUS_STYLE.Good;
          return (
            <div key={s.label} className="rounded-md border border-ink-100 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink-900">{s.label}</div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: style.bg, color: style.fg }}
                >
                  {style.label}
                </span>
              </div>
              {s.note && (
                <p className="mt-2 text-sm text-ink-700">{s.note}</p>
              )}
              {s.note && (
                <div className="mt-2 flex gap-1.5">
                  <Button variant="primary" className="text-xs" onClick={() => pushToast({ type: "info", message: "Fix applied." })}>Fix Issue</Button>
                  <Button variant="secondary" className="text-xs">Edit manually</Button>
                  <Button variant="ghost" className="text-xs" onClick={() => pushToast({ type: "info", message: "Issue ignored." })}>Ignore</Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-ink-100 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">Summary</div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-ink-900">2</div>
            <div className="text-xs text-ink-500">Need attention</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-ink-900">3</div>
            <div className="text-xs text-ink-500">Grammar issues</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-ink-900">3</div>
            <div className="text-xs text-ink-500">Resolved by AI</div>
          </div>
        </div>
      </div>
    </div>
  );
}