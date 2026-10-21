import type { MessageKey } from "../i18n";
/** Classement des variables CSS d'un site en familles de design system, d'après leur nom et leur valeur. */

export type TokenKind =
  | "color"
  | "font"
  | "weight"
  | "size"
  | "leading"
  | "tracking"
  | "radius"
  | "spacing"
  | "shadow"
  | "layout"
  | "other";

export interface TokenGroupDefinition {
  id: string;
  title: MessageKey;
  kinds: readonly TokenKind[];
}

export const TOKEN_GROUPS: readonly TokenGroupDefinition[] = [
  { id: "colors", title: "kind.colors", kinds: ["color"] },
  { id: "type", title: "kind.type", kinds: ["font", "weight", "size", "leading", "tracking"] },
  { id: "radius", title: "kind.radius", kinds: ["radius"] },
  { id: "spacing", title: "kind.spacing", kinds: ["spacing"] },
  { id: "shadow", title: "kind.shadow", kinds: ["shadow"] },
  { id: "layout", title: "kind.layout", kinds: ["layout"] },
  { id: "other", title: "kind.other", kinds: ["other"] },
];

const LENGTH = /^-?\d*\.?\d+(px|rem|em|%|ch|vw|vh)?$/;

function isLength(value: string): boolean {
  return LENGTH.test(value.trim());
}

/**
 * Exemples : --primary: #b23a48 → color ; --font-sans: "Host Grotesk" → font ; --text-lg: 1.125rem → size ;
 * --radius: .625rem → radius ; --spacing: .25rem → spacing ; --shadow-md: 0 4px … → shadow.
 */
export function classifyToken(name: string, value: string, isColor: (value: string) => boolean): TokenKind {
  const n = name.toLowerCase();
  const v = value.trim();
  if (isColor(v)) return "color";
  if (/shadow/.test(n)) return "shadow";
  if (/weight/.test(n)) return "weight";
  if (/leading|line-height|lineheight/.test(n)) return "leading";
  if (/tracking|letter-spacing|letterspacing/.test(n)) return "tracking";
  if (/radius|rounded/.test(n)) return "radius";
  if (/(^--font|family|typeface)/.test(n) && !isLength(v)) return "font";
  if (/container|breakpoint|screen|max-w|width|height|aspect/.test(n)) return "layout";
  if (/spacing|space|gap|gutter|padding|margin|inset/.test(n)) return "spacing";
  if (/(^--text|font-size|fontsize|^--fs|size|heading|^--h[1-6]$)/.test(n)) return "size";
  return "other";
}

/** Unités proposées pour une valeur, en commençant par celle qu'elle utilise déjà. */
export function unitsFor(value: string): string[] {
  const unit = /[a-z%]+$/i.exec(value.trim())?.[0]?.toLowerCase() ?? "";
  switch (unit) {
    case "rem":
      return ["rem", "px"];
    case "px":
      return ["px", "rem"];
    case "em":
      return ["em", "px"];
    default:
      return [unit];
  }
}

/** Pas de réglage adapté à l'unité (les rem bougent par 1/16, les px par 1). */
export function stepFor(value: string, kind: TokenKind): number {
  if (kind === "weight") return 100;
  if (kind === "leading" && !/[a-z]$/i.test(value.trim())) return 0.05;
  if (/rem$|em$/.test(value.trim())) return kind === "tracking" ? 0.005 : 0.0625;
  return 1;
}
