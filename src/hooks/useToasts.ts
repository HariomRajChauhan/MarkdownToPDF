import { useCallback, useRef, useState } from "react";
import type { Toast, ToastType } from "@/types";

let nextId = 1;

/**
 * Minimal, dependency-free toast notification system.
 * Toasts auto-dismiss after `duration` ms.
 */
export function useToasts(duration = 2800) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss, duration]
  );

  return { toasts, toast, dismiss } as const;
}
