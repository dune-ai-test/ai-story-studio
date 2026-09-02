import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/Button";
import { DEFAULT_EXPORT_OPTIONS, type ExportOptions, type Project } from "@/lib/models";

export default function ExportPage() {
  const project = useAppStore((s) => s.project);
  const pushToast = useAppStore((s) => s.pushToast);
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);

  if (!project) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Export your story</h1>
        <p className="mt-1 text-sm text-ink-500">Download your finished manuscript.</p>
        <div className="mt-6 rounded-md border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
          No project selected.
        </div>
      </div>
    );
  }

  const p: Project = project;

  async function doExport(format: "word" | "pdf") {
    try {
      const { tauri } = await import("@/lib/tauri");
      const bytes = format === "word"
        ? await tauri.exportWord(p, options)
        : await tauri.exportPdf(p, options);

      // Download the bytes via a Blob URL.
      const blob = new Blob([bytes as any], {
        type: format === "word"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${p.title}.${format === "word" ? "docx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      pushToast({ type: "success", message: `${format === "word" ? "Word" : "PDF"} export is ready.` });
    } catch (e: any) {
      pushToast({ type: "error", message: e?.message ?? "Export failed." });
    }
  }

  function toggle(key: keyof ExportOptions) {
    setOptions((o) => ({ ...o, [key]: !o[key] }));
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Export your story</h1>
        <p className="mt-1 text-sm text-ink-500">Download your finished manuscript.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md border border-ink-100 p-4">
          <div className="text-sm font-semibold text-ink-900">Microsoft Word</div>
          <div className="mt-1 text-xs text-ink-500">.docx — opens in Microsoft Word or any word processor.</div>
          <Button variant="primary" className="mt-3 w-full" onClick={() => doExport("word")}>Download Word</Button>
        </div>
        <div className="rounded-md border border-ink-100 p-4">
          <div className="text-sm font-semibold text-ink-900">PDF</div>
          <div className="mt-1 text-xs text-ink-500">.pdf — opens in any PDF reader. No external software needed.</div>
          <Button variant="secondary" className="mt-3 w-full" onClick={() => doExport("pdf")}>Download PDF</Button>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-ink-100 p-4">
        <div className="text-sm font-semibold text-ink-900">Optional formats</div>
        <div className="mt-2 flex gap-2">
          <Button variant="ghost" className="text-xs" onClick={async () => {
            try {
              const { tauri } = await import("@/lib/tauri");
              const text = await tauri.exportPlainText(p);
              download(text, `${p.title}.txt`, "text/plain");
              pushToast({ type: "success", message: "Plain text export ready." });
            } catch (e: any) { pushToast({ type: "error", message: e?.message ?? "Export failed." }); }
          }}>Plain Text</Button>
          <Button variant="ghost" className="text-xs" onClick={async () => {
            try {
              const { tauri } = await import("@/lib/tauri");
              const text = await tauri.exportMarkdown(p);
              download(text, `${p.title}.md`, "text/markdown");
              pushToast({ type: "success", message: "Markdown export ready." });
            } catch (e: any) { pushToast({ type: "error", message: e?.message ?? "Export failed." }); }
          }}>Markdown</Button>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-ink-100 p-4">
        <div className="text-sm font-semibold text-ink-900">Options</div>
        <div className="mt-2 space-y-2">
          <Checkbox label="Include title page" checked={options.include_title_page} toggle={() => toggle("include_title_page")} />
          <Checkbox label="Include author name" checked={options.include_author_name} toggle={() => toggle("include_author_name")} />
          <Checkbox label="Include table of contents" checked={options.include_toc} toggle={() => toggle("include_toc")} />
          <Checkbox label="Include scene headings" checked={options.include_scene_headings} toggle={() => toggle("include_scene_headings")} />
          <Checkbox label="Include character notes" checked={options.include_character_notes} toggle={() => toggle("include_character_notes")} />
          <Checkbox label="Include captions" checked={options.include_captions} toggle={() => toggle("include_captions")} />
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-400">
        This is a written story studio. We do not export audio, video, voiceover, music, or animation.
      </p>
    </div>
  );
}

function Checkbox({ label, checked, toggle }: { label: string; checked: boolean; toggle: () => void }) {
  return (
    <button onClick={toggle} className="flex items-center gap-2 text-sm text-ink-700 hover:text-ink-900">
      <span className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? "bg-accent border-accent" : "border-ink-200"}`}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}