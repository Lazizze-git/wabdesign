import type { Change, ChangeGroup } from "./types";

/**
 * Les retouches sont rangées dans des « cascade layers » déclarées tout en haut du <head>.
 * Pour les déclarations `!important`, la première couche déclarée l'emporte : une retouche
 * d'élément (inspect) passe donc devant un réglage global, lui-même devant un échange de couleur.
 * Et toute déclaration `!important` en couche passe devant celles du site, hors attribut style.
 */
export const LAYER_ORDER = ["od-inspect", "od-system", "od-fonts", "od-vars", "od-swap"] as const;

export const LAYER_DECLARATION = `@layer ${LAYER_ORDER.join(", ")};`;

/** Groupes qui deviennent du CSS (les échanges de couleur et les textes sont appliqués autrement). */
type CssGroup = Exclude<ChangeGroup, "text">;

const GROUP_LAYER: Record<CssGroup, (typeof LAYER_ORDER)[number]> = {
  inspect: "od-inspect",
  system: "od-system",
  fonts: "od-fonts",
  vars: "od-vars",
  swap: "od-swap",
};

export function layerOf(group: CssGroup): string {
  return GROUP_LAYER[group];
}

/** Deux modifications de même clé se remplacent : la plus récente gagne. */
export function changeKey(change: Pick<Change, "group" | "target" | "property" | "previous">): string {
  const base = `${change.group}|${change.target.selector}|${change.property}`;
  return change.group === "swap" ? `${base}|${change.previous ?? ""}` : base;
}

const FORBIDDEN = /[{}<;]/;

/** Refuse tout ce qui pourrait sortir de la déclaration CSS prévue. */
export function isSafeCss(text: string): boolean {
  return !FORBIDDEN.test(text) && !text.includes("/*");
}

export function declaration(property: string, value: string): string {
  return `${property}: ${value} !important;`;
}

/** Transforme les modifications (hors échanges de couleur) en une feuille de style. */
export function changesToCss(changes: readonly Change[]): string {
  const byLayer = new Map<string, Map<string, string[]>>();
  for (const change of changes) {
    if (change.group === "swap" || change.group === "text") continue;
    if (!isSafeCss(change.value) || !isSafeCss(change.property)) continue;
    if (/[{}<]/.test(change.target.selector)) continue;
    const layer = layerOf(change.group);
    const rules = byLayer.get(layer) ?? new Map<string, string[]>();
    const declarations = rules.get(change.target.selector) ?? [];
    declarations.push(declaration(change.property, change.value));
    rules.set(change.target.selector, declarations);
    byLayer.set(layer, rules);
  }
  const blocks: string[] = [];
  for (const layer of LAYER_ORDER) {
    const rules = byLayer.get(layer);
    if (!rules) continue;
    const body = [...rules].map(([selector, decls]) => `  ${selector} { ${decls.join(" ")} }`);
    blocks.push(`@layer ${layer} {\n${body.join("\n")}\n}`);
  }
  return blocks.join("\n");
}

/** Valeur CSS de font-family, avec une police de secours cohérente. */
export function fontFamilyValue(family: string, category: string | null): string {
  const fallback = category === "Serif" ? "serif" : category === "Monospace" ? "monospace" : "sans-serif";
  return `"${family.replace(/"/g, "")}", ${fallback}`;
}
