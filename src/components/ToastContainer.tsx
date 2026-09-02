import { useAppStore } from "@/lib/store";

const ICONS: Record<string, string> = {
  info: "ℹ",
  success: "✓",
  warning: "!",
  error: "✗",
};

const COLORS: Record<string, string> = {
  info: "border-accent/40 bg-accent-soft text-accent",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-red-200 bg-red-50 text-red-700",
};

export default function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  return (
    <div className="fixed right-4 top-16 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm shadow-md transition-opacity duration-200 ease-out ${COLORS[t.type]}`}
        >
          <span className="mt-0.5">{ICONS[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="ml-2 opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}