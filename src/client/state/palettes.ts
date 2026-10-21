import { language, t } from "../i18n";
import { computed, signal } from "@preact/signals";
import type { Change, Palette } from "../../shared/types";
import { colorKey, luminance, parseColor } from "../engine/colors";
import { sheetScan } from "../engine/overrides";
import type { ColorVariable } from "../engine/stylesheet-scan";
import { visibleColors } from "../engine/swap-css";
import { changes, upsertChange, upsertMany } from "./changes";
import { updateConfig } from "./library";
import { notify, uid } from "./toasts";
import { findToken, tokenTarget } from "./tokens";
import { getHost } from "./ui";

/** Couleur « en main » : cliquer ensuite sur une couleur du site la remplace. */
export const armedColor = signal<string | null>(null);
/** Recompté à chaque ouverture de l'onglet et à chaque rechargement des styles. */
export const visibleCounts = signal<Map<string, number>>(new Map());

/**
 * Une couleur déjà échangée n'est plus visible sous son nom d'origine : on garde donc
 * le plus grand compte déjà observé, pour qu'elle ne disparaisse pas de la liste.
 */
export function refreshVisibleColors(): void {
  const merged = new Map(visibleCounts.value);
  for (const [key, count] of visibleColors(getHost())) merged.set(key, Math.max(count, merged.get(key) ?? 0));
  visibleCounts.value = merged;
}

export interface SiteColor {
  key: string;
  visible: number;
  usage: number;
}

/** Couleurs du site qu'on sait échanger, les plus visibles d'abord. */
export const siteColors = computed<SiteColor[]>(() => {
  const counts = visibleCounts.value;
  return [...sheetScan.value.usage]
    .map(([key, usage]) => ({ key, usage, visible: counts.get(key) ?? 0 }))
    .sort((a, b) => b.visible - a.visible || b.usage - a.usage);
});

export function swapChange(fromKey: string, value: string): Change {
  return {
    id: uid("chg"),
    group: "swap",
    target: { selector: "*", label: t("colors.wholePage"), scope: "global", context: null },
    property: "color",
    value,
    previous: fromKey,
    font: null,
  };
}

export function currentSwap(fromKey: string): Change | undefined {
  return changes.value.find((change) => change.group === "swap" && change.previous === fromKey);
}

export function variableChange(variable: ColorVariable, value: string): Change {
  return {
    id: uid("chg"),
    group: "vars",
    target: tokenTarget(findToken(variable.name) ?? variable),
    property: variable.name,
    value,
    previous: variable.value,
    font: null,
  };
}

export function setVariable(variable: ColorVariable, value: string): void {
  upsertChange(variableChange(variable, value));
}

export function setSwap(fromKey: string, value: string): void {
  upsertChange(swapChange(fromKey, value));
}

/** Essai rapide : associe les couleurs principales du site à celles de la palette, de la plus claire à la plus foncée. */
export function tryPalette(palette: Palette): void {
  const brightness = (color: string): number => {
    const parsed = parseColor(color);
    return parsed ? luminance(parsed) : 0;
  };
  const source = siteColors.value.filter((color) => color.visible > 0).slice(0, palette.colors.length);
  if (source.length === 0) {
    notify(t("palettes.nothing"), "error");
    return;
  }
  const from = [...source].sort((a, b) => brightness(a.key) - brightness(b.key));
  const to = [...palette.colors].sort((a, b) => brightness(a) - brightness(b));
  const step = to.length / from.length;
  upsertMany(from.map((color, index) => swapChange(color.key, to[Math.floor(index * step)] ?? color.key)));
  notify(t("palettes.applied", { name: palette.name, n: from.length }));
}

export function addPalette(name: string, colors: readonly string[]): void {
  const unique = [...new Set(colors.map((color) => colorKey(color) ?? color))];
  const palette: Palette = { id: uid("pal"), name: name.trim() || t("palettes.defaultName", { date: new Date().toLocaleDateString(language.value === "fr" ? "fr-CH" : "en-GB") }), colors: unique };
  void updateConfig((current) => ({ ...current, palettes: [palette, ...current.palettes] }));
}

export function deletePalette(id: string): void {
  void updateConfig((current) => ({ ...current, palettes: current.palettes.filter((palette) => palette.id !== id) }));
}
