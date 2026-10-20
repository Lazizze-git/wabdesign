import { signal } from "@preact/signals";
import { getHost } from "../state/ui";

/**
 * Augmente quand la page change (hydratation, navigation, rechargement à chaud).
 * Les réglages qui lisent les valeurs de la page s'y abonnent pour ne jamais afficher
 * des valeurs périmées ou vides.
 */
export const pageVersion = signal(0);

const SETTLE_MS = 300;

export function startPageWatch(): void {
  let timer: number | undefined;
  const observer = new MutationObserver((records) => {
    const host = getHost();
    if (records.every((record) => host?.contains(record.target))) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => (pageVersion.value += 1), SETTLE_MS);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("load", () => (pageVersion.value += 1));
}
