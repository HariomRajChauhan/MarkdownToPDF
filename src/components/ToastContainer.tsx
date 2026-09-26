"use client";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

const ICONS: Record<ToastItem["type"], string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const STYLES: Record<ToastItem["type"], string> = {
  success:
    "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100",
  error:
    "border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/80 dark:text-rose-100",
  info: "border-blue-500/40 bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-100",
};

const BADGES: Record<ToastItem["type"], string> = {
  success: "bg-emerald-500 text-white",
  error: "bg-rose-500 text-white",
  info: "bg-blue-500 text-white",
};

/** Accessible toast notification stack (bottom-right). */
export default function ToastContainer({
  toasts,
  onDismiss,
}: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      role="status"
      className="pointer-events-none fixed bottom-16 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass pointer-events-auto flex animate-toast-in items-center gap-3 rounded-xl border px-4 py-3 shadow-soft ${STYLES[t.type]}`}
        >
          <span
            aria-hidden="true"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${BADGES[t.type]}`}
          >
            {ICONS[t.type]}
          </span>
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-md p-1 text-current opacity-60 transition hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
