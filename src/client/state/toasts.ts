import { signal } from "@preact/signals";

export interface Toast {
  id: number;
  message: string;
  tone: "info" | "error";
}

export const toasts = signal<readonly Toast[]>([]);
let nextId = 1;

/** Petit message temporaire en bas du panneau (jamais d'erreur silencieuse). */
export function notify(message: string, tone: Toast["tone"] = "info"): void {
  const id = nextId++;
  toasts.value = [...toasts.value, { id, message, tone }];
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, tone === "error" ? 6000 : 3000);
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
