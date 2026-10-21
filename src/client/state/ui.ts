import { signal } from "@preact/signals";

export type TabId = "fonts" | "colors" | "inspect" | "system" | "changes" | "settings";

const STORAGE_KEY = "outil-design:ui";

interface StoredUi {
  tab: TabId;
  minimized: boolean;
  hidden: boolean;
  position: { x: number; y: number } | null;
}

function readStored(): Partial<StoredUi> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<StoredUi>) : {};
  } catch {
    return {};
  }
}

const stored = readStored();

export const activeTab = signal<TabId>(stored.tab ?? "fonts");
export const minimized = signal(stored.minimized ?? false);
export const hidden = signal(stored.hidden ?? false);
/** Demande explicite de revoir l’introduction (depuis les réglages). */
export const welcomeRequested = signal(false);
/** Position du panneau quand on l'a déplacé (sinon : en haut à droite). */
export const position = signal<{ x: number; y: number } | null>(stored.position ?? null);

/** Petites préférences d'affichage, mémorisées dans ce navigateur uniquement. */
export function rememberUi(): void {
  const data: StoredUi = {
    tab: activeTab.value,
    minimized: minimized.value,
    hidden: hidden.value,
    position: position.value,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Stockage indisponible (navigation privée) : sans conséquence.
  }
}

let host: Element | null = null;

/** L'élément qui contient le panneau : à ignorer quand on lit ou inspecte la page. */
export function setHost(element: Element): void {
  host = element;
}

export function getHost(): Element | null {
  return host;
}
