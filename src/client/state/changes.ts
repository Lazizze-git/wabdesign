import { computed, signal } from "@preact/signals";
import { changeKey } from "../../shared/css";
import type { Change } from "../../shared/types";
import { api } from "../api";
import { notify } from "./toasts";

/** Toutes les modifications en cours, dans l'ordre où elles ont été faites. */
export const changes = signal<readonly Change[]>([]);
/** « Avant » : coupe temporairement toutes les retouches pour comparer. */
export const showOriginal = signal(false);

const past = signal<(readonly Change[])[]>([]);
const future = signal<(readonly Change[])[]>([]);
export const canUndo = computed(() => past.value.length > 0);
export const canRedo = computed(() => future.value.length > 0);

const HISTORY_LIMIT = 200;
let saveTimer: number | undefined;
let lastCommitKey = "";
let lastCommitAt = 0;

function persist(): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    api.saveSession({ changes: [...changes.value] }).catch(() => notify("Session non enregistrée", "error"));
  }, 400);
}

/**
 * Remplace l'état. Les réglages en continu (curseur, glisser) sur la même propriété
 * sont regroupés en une seule étape d'annulation.
 */
function commit(next: readonly Change[], mergeKey: string | null): void {
  const now = Date.now();
  const merge = mergeKey !== null && mergeKey === lastCommitKey && now - lastCommitAt < 800;
  if (!merge) past.value = [...past.value, changes.value].slice(-HISTORY_LIMIT);
  future.value = [];
  lastCommitKey = mergeKey ?? "";
  lastCommitAt = now;
  changes.value = next;
  persist();
}

export function upsertChange(change: Change): void {
  const key = changeKey(change);
  const existing = changes.value.find((item) => changeKey(item) === key);
  const kept = existing?.previous ?? change.previous;
  const next = changes.value.filter((item) => changeKey(item) !== key);
  commit([...next, { ...change, previous: kept }], key);
}

export function upsertMany(batch: readonly Change[]): void {
  const keys = new Set(batch.map(changeKey));
  const next = changes.value.filter((item) => !keys.has(changeKey(item)));
  commit([...next, ...batch], null);
}

export function removeChange(key: string): void {
  commit(changes.value.filter((item) => changeKey(item) !== key), null);
}

export function removeWhere(predicate: (change: Change) => boolean): void {
  const next = changes.value.filter((item) => !predicate(item));
  if (next.length !== changes.value.length) commit(next, null);
}

export function clearChanges(): void {
  if (changes.value.length > 0) commit([], null);
}

export function undo(): void {
  const previous = past.value.at(-1);
  if (!previous) return;
  past.value = past.value.slice(0, -1);
  future.value = [changes.value, ...future.value];
  changes.value = previous;
  lastCommitKey = "";
  persist();
}

export function redo(): void {
  const next = future.value[0];
  if (!next) return;
  future.value = future.value.slice(1);
  past.value = [...past.value, changes.value];
  changes.value = next;
  lastCommitKey = "";
  persist();
}

export function findChange(group: Change["group"], selector: string, property: string): Change | undefined {
  return changes.value.find(
    (item) => item.group === group && item.target.selector === selector && item.property === property,
  );
}

export async function restoreSession(): Promise<void> {
  try {
    const session = await api.session();
    changes.value = session.changes;
  } catch {
    notify("Impossible de reprendre la session précédente", "error");
  }
}
