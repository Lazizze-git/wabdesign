/** Lecture et écriture des valeurs CSS numériques (« 16px », « 1.5 », « -0.02em »). */

export interface Length {
  value: number;
  unit: string;
}

export function parseLength(text: string): Length | null {
  const match = /^\s*(-?\d*\.?\d+)\s*([a-z%]*)\s*$/i.exec(text);
  if (!match?.[1]) return null;
  return { value: Number(match[1]), unit: (match[2] ?? "").toLowerCase() };
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatLength(length: Length): string {
  const decimals = length.unit === "px" || length.unit === "" ? 2 : 3;
  return `${roundTo(length.value, decimals)}${length.unit}`;
}

/** Convertit une valeur calculée (toujours en px) dans l'unité voulue, pour pré-remplir les champs. */
export function convertPx(px: number, unit: string, fontSizePx: number, rootFontSizePx: number): number {
  switch (unit) {
    case "em":
      return px / fontSizePx;
    case "rem":
      return px / rootFontSizePx;
    case "":
      return px / fontSizePx;
    default:
      return px;
  }
}

/** Valeur CSS acceptable pour cette propriété ? (vérifiée par le navigateur lui-même) */
export function isValidCss(property: string, value: string): boolean {
  if (!value.trim() || /[;{}<]/.test(value)) return false;
  if (property.startsWith("--")) return true;
  return CSS.supports(property, value);
}

/** Nom courant d'une graisse. */
export function weightName(weight: number): string {
  const names: [number, string][] = [
    [100, "Thin"],
    [200, "ExtraLight"],
    [300, "Light"],
    [400, "Regular"],
    [500, "Medium"],
    [600, "SemiBold"],
    [700, "Bold"],
    [800, "ExtraBold"],
    [900, "Black"],
  ];
  const exact = names.find(([value]) => value === weight);
  return exact ? `${exact[1]} ${weight}` : String(weight);
}
