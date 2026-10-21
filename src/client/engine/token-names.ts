import { t, tn, type MessageKey } from "../i18n";
/** Noms lisibles pour les variables CSS : « --color-encre-2 » → « Encre 2 ». */

/** Préfixe technique → mot lisible (null : le préfixe est redondant avec la famille, on le retire). */
const PREFIXES: readonly [RegExp, MessageKey | null][] = [
  [/^color-/, null],
  [/^font-weight-/, "token.weight"],
  [/^font-/, "token.font"],
  [/^text-/, "token.size"],
  [/^leading-/, "token.leading"],
  [/^tracking-/, "token.tracking"],
  [/^radius-/, null],
  [/^spacing-/, "token.spacing"],
  [/^shadow-/, null],
  [/^breakpoint-/, "token.screen"],
  [/^container-/, "token.container"],
  [/^ease-/, "token.ease"],
];

const WHOLE: Record<string, MessageKey> = {
  radius: "token.radiusBase",
  spacing: "token.spacingBase",
  shadow: "token.shadowBase",
};

export function friendlyTokenName(name: string): string {
  const bare = name.replace(/^--/, "");
  const whole = WHOLE[bare];
  if (whole) return t(whole);
  let label = bare;
  for (const [pattern, replacement] of PREFIXES) {
    if (pattern.test(label)) {
      label = label.replace(pattern, replacement ? t(replacement) : "");
      break;
    }
  }
  const spaced = label.replace(/--/g, " · ").replace(/[-_]+/g, " ").trim() || bare;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function usageLabel(uses: number): string {
  if (uses === 0) return t("token.unused");
  return tn(uses, "token.uses.one", "token.uses.other");
}

/** Recherche sur le nom lisible et sur le nom technique. */
export function matchesToken(name: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return !q || name.toLowerCase().includes(q) || friendlyTokenName(name).toLowerCase().includes(q);
}
