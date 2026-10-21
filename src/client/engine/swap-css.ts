import { declaration, isSafeCss } from "../../shared/css";
import type { Change } from "../../shared/types";
import { colorKey } from "./colors";
import type { SheetScan } from "./stylesheet-scan";

/**
 * Échange de couleur : pour chaque règle du site qui utilise l'ancienne couleur,
 * on écrit une règle jumelle (même sélecteur, mêmes @media) avec la nouvelle.
 * Ça marche aussi pour :hover, les variables, et les éléments ajoutés plus tard.
 */
export function buildSwapCss(scan: SheetScan, swaps: readonly Change[]): string {
  const replacements = new Map<string, string>();
  for (const swap of swaps) {
    const from = swap.previous ? colorKey(swap.previous) : null;
    if (from && isSafeCss(swap.value)) replacements.set(from, swap.value);
  }
  if (replacements.size === 0) return "";
  const rules: string[] = [];
  for (const item of scan.declarations) {
    const replacement = replacements.get(item.key);
    if (!replacement) continue;
    let rule = `${item.selector} { ${declaration(item.property, replacement)} }`;
    for (const wrapper of [...item.wrappers].reverse()) rule = `${wrapper} { ${rule} }`;
    rules.push(rule);
  }
  return rules.length > 0 ? `@layer od-swap {\n${rules.join("\n")}\n}` : "";
}

const COMPUTED_PROPERTIES = ["color", "background-color", "border-top-color", "fill", "stroke"] as const;
const MAX_ELEMENTS = 4000;

/** Couleurs réellement visibles sur la page (lues sur les éléments affichés). */
export function visibleColors(host: Element | null): Map<string, number> {
  const counts = new Map<string, number>();
  // <html> et <body> portent souvent le fond et la couleur du texte de toute la page.
  const elements = [document.documentElement, document.body, ...Array.from(document.body.querySelectorAll("*")).slice(0, MAX_ELEMENTS)];
  for (const element of elements) {
    if (host?.contains(element)) continue;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") continue;
    for (const property of COMPUTED_PROPERTIES) {
      if (property === "border-top-color" && parseFloat(style.borderTopWidth) === 0) continue;
      if ((property === "fill" || property === "stroke") && !(element instanceof SVGElement)) continue;
      const key = colorKey(style.getPropertyValue(property));
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}
