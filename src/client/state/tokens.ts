import { computed } from "@preact/signals";
import { changeKey } from "../../shared/css";
import type { Change, FontRef, Target } from "../../shared/types";
import { isColorLiteral } from "../engine/colors";
import { sheetScan } from "../engine/overrides";
import type { DesignToken } from "../engine/stylesheet-scan";
import { classifyToken, type TokenKind } from "../engine/token-kinds";
import { changes, removeChange, upsertChange } from "./changes";
import { uid } from "./toasts";

export interface ClassifiedToken extends DesignToken {
  kind: TokenKind;
}

/** Toutes les variables du site, classées, les plus utilisées d'abord. */
export const designTokens = computed<ClassifiedToken[]>(() =>
  sheetScan.value.tokens
    .map((token) => ({ ...token, kind: classifyToken(token.name, resolvedValue(token), isColorLiteral) }))
    .sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name, "fr", { numeric: true })),
);

/** Variables du site seulement, et variables venues d’ailleurs (extensions, bibliothèques). */
export const siteTokens = computed(() => designTokens.value.filter((token) => !token.external));
export const externalTokens = computed(() => designTokens.value.filter((token) => token.external));

/** La retouche vise toutes les règles où la variable est définie (ex. :root et .dark). */
export function tokenTarget(token: Pick<DesignToken, "name" | "selectors">): Target {
  return { selector: token.selectors.join(", "), label: token.name, scope: "global", context: null };
}

export function findToken(name: string): DesignToken | undefined {
  return sheetScan.value.tokens.find((token) => token.name === name);
}

/** Valeur d'origine lisible : si la variable renvoie vers une autre (var(--x)), on montre le résultat. */
export function resolvedValue(token: DesignToken): string {
  if (!token.value.includes("var(")) return token.value;
  // La variable peut être définie sur une classe (.univers) plutôt qu’à la racine : on la lit
  // sur un élément où elle s’applique vraiment.
  for (const element of [...token.selectors.map(firstMatch), document.documentElement]) {
    if (!element) continue;
    const computedValue = getComputedStyle(element).getPropertyValue(token.name).trim();
    if (computedValue && !computedValue.includes("var(")) return computedValue;
  }
  return token.value;
}

function firstMatch(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

export function tokenChange(token: DesignToken): Change | undefined {
  const selector = tokenTarget(token).selector;
  return changes.value.find((change) => change.group === "vars" && change.target.selector === selector && change.property === token.name);
}

export function setToken(token: DesignToken, value: string, font: FontRef | null = null): void {
  upsertChange({
    id: uid("chg"),
    group: "vars",
    target: tokenTarget(token),
    property: token.name,
    value,
    previous: token.value,
    font,
  });
}

export function resetToken(token: DesignToken): void {
  const existing = tokenChange(token);
  if (existing) removeChange(changeKey(existing));
}
