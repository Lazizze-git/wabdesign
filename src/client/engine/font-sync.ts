import { effect } from "@preact/signals";
import type { FontFamily } from "../../shared/types";
import { changes } from "../state/changes";
import { allFamilies, findFamily } from "../state/library";
import { loadFamily } from "./font-loader";

/** Recharge automatiquement les polices utilisées par les retouches (après un rechargement de page). */
export function startFontSync(): void {
  effect(() => {
    if (allFamilies.value.length === 0) return;
    for (const change of changes.value) {
      if (!change.font) continue;
      const family = findFamily(change.font);
      if (family) loadFamily(family);
    }
  });
}

/** Retrouve la famille affichée à partir d'une valeur `font-family` (« "Host Grotesk", sans-serif »). */
export function familyFromCss(value: string): FontFamily | undefined {
  const first = value.split(",")[0]?.trim().replace(/^["']|["']$/g, "").toLowerCase();
  if (!first) return undefined;
  return allFamilies.value.find((family) => family.family.toLowerCase() === first);
}

export function firstFamilyName(value: string): string {
  return value.split(",")[0]?.trim().replace(/^["']|["']$/g, "") ?? "";
}

/** Graisse disponible la plus proche de celle demandée. */
export function nearestWeight(family: FontFamily, weight: number, italic: boolean): number {
  const variable = family.faces.find((face) => face.weightRange);
  if (variable?.weightRange) {
    return Math.min(variable.weightRange[1], Math.max(variable.weightRange[0], weight));
  }
  const faces = family.faces.filter((face) => (face.style === "italic") === italic);
  const pool = faces.length > 0 ? faces : family.faces;
  let best = pool[0]?.weight ?? 400;
  for (const face of pool) {
    if (Math.abs(face.weight - weight) < Math.abs(best - weight)) best = face.weight;
  }
  return best;
}
