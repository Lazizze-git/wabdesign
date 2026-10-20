/** Noms lisibles pour les variables CSS : « --color-encre-2 » → « Encre 2 ». */

const PREFIXES: readonly [RegExp, string][] = [
  [/^color-/, ""],
  [/^font-weight-/, "Graisse "],
  [/^font-/, "Police "],
  [/^text-/, "Taille "],
  [/^leading-/, "Interligne "],
  [/^tracking-/, "Interlettrage "],
  [/^radius-/, ""],
  [/^spacing-/, "Espacement "],
  [/^shadow-/, ""],
  [/^breakpoint-/, "Écran "],
  [/^container-/, "Conteneur "],
  [/^ease-/, "Courbe "],
];

const WHOLE: Record<string, string> = {
  radius: "Arrondi",
  spacing: "Espacement de base",
  shadow: "Ombre",
};

export function friendlyTokenName(name: string): string {
  const bare = name.replace(/^--/, "");
  const whole = WHOLE[bare];
  if (whole) return whole;
  let label = bare;
  for (const [pattern, replacement] of PREFIXES) {
    if (pattern.test(label)) {
      label = label.replace(pattern, replacement);
      break;
    }
  }
  const spaced = label.replace(/--/g, " · ").replace(/[-_]+/g, " ").trim() || bare;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function usageLabel(uses: number): string {
  if (uses === 0) return "non utilisée";
  return uses === 1 ? "1 usage" : `${uses} usages`;
}

/** Recherche sur le nom lisible et sur le nom technique. */
export function matchesToken(name: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return !q || name.toLowerCase().includes(q) || friendlyTokenName(name).toLowerCase().includes(q);
}
