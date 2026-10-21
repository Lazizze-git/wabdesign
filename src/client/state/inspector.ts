import { t } from "../i18n";
import { computed, signal } from "@preact/signals";
import type { Target, TargetScope } from "../../shared/types";
import { countMatches, describeElement, humanLabel, similarSelector, uniqueSelector } from "../engine/selector";
import { pageVersion } from "../engine/page-watch";
import { getHost } from "./ui";

export const inspecting = signal(false);
export const hovered = signal<Element | null>(null);
export const selected = signal<Element | null>(null);
export const scope = signal<TargetScope>("element");
/** Éléments à surligner quand on survole une modification dans la liste. */
export const highlightSelector = signal<string | null>(null);

export interface ScopeOption {
  scope: TargetScope;
  selector: string;
  label: string;
  count: number;
}

export function scopeOptions(element: Element): ScopeOption[] {
  const tag = element.tagName.toLowerCase();
  const options: ScopeOption[] = [{ scope: "element", selector: uniqueSelector(element), label: t("inspect.scopeElement"), count: 1 }];
  const similar = similarSelector(element);
  const similarCount = similar ? countMatches(similar) : 0;
  if (similar && similarCount > 1) {
    options.push({ scope: "similar", selector: similar, label: t("inspect.scopeSimilar"), count: similarCount });
  }
  options.push({ scope: "tag", selector: tag, label: t("inspect.scopeTag", { tag }), count: countMatches(tag) });
  return options;
}

/** La cible des retouches de l'inspecteur, selon la portée choisie. */
export const currentTarget = computed<Target | null>(() => {
  void pageVersion.value;
  const element = selected.value;
  if (!element?.isConnected) return null;
  const options = scopeOptions(element);
  const option = options.find((candidate) => candidate.scope === scope.value) ?? options[0];
  if (!option) return null;
  const label = option.scope === "element" ? humanLabel(element) : `${option.label} (${humanLabel(element)})`;
  return { selector: option.selector, label, scope: option.scope, context: describeElement(element, option.selector) };
});

function isOwn(event: Event): boolean {
  const host = getHost();
  return host !== null && event.composedPath().includes(host);
}

function elementFrom(event: Event): Element | null {
  const first = event.composedPath()[0];
  return first instanceof Element ? first : null;
}

function onMove(event: PointerEvent): void {
  if (isOwn(event)) return;
  hovered.value = elementFrom(event);
}

function block(event: Event): void {
  if (isOwn(event)) return;
  event.preventDefault();
  event.stopPropagation();
}

function onClick(event: MouseEvent): void {
  if (isOwn(event)) return;
  block(event);
  // Le mode sélection reste actif : on clique un élément, puis un autre, comme dans Figma.
  const element = elementFrom(event);
  if (element) select(element);
}

function onKey(event: KeyboardEvent): void {
  if (event.key === "Escape") clearInspection();
}

const BLOCKED = ["pointerdown", "mousedown", "pointerup", "mouseup", "dblclick", "submit"] as const;

export function startInspecting(): void {
  if (inspecting.value) return;
  inspecting.value = true;
  window.addEventListener("pointermove", onMove, true);
  window.addEventListener("click", onClick, true);
  window.addEventListener("keydown", onKey, true);
  for (const type of BLOCKED) window.addEventListener(type, block, true);
}

export function stopInspecting(): void {
  inspecting.value = false;
  hovered.value = null;
  window.removeEventListener("pointermove", onMove, true);
  window.removeEventListener("click", onClick, true);
  window.removeEventListener("keydown", onKey, true);
  for (const type of BLOCKED) window.removeEventListener(type, block, true);
}

/** Échap : quitte le mode sélection et désélectionne, d’un seul geste. */
export function clearInspection(): void {
  stopInspecting();
  select(null);
}

export function select(element: Element | null): void {
  selected.value = element;
  if (element && scope.value !== "element" && !scopeOptions(element).some((o) => o.scope === scope.value)) {
    scope.value = "element";
  }
}

export function selectParent(): void {
  const parent = selected.value?.parentElement;
  if (parent && parent !== document.documentElement) select(parent);
}
