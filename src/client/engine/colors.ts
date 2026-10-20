/** Outils couleur : lecture de n'importe quelle couleur CSS (hex, rgb, hsl, oklch…) en RGBA. */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const KEYWORDS = new Set(["inherit", "initial", "unset", "revert", "revert-layer", "currentcolor", "transparent", "none"]);
const cache = new Map<string, Rgba | null>();
let context: CanvasRenderingContext2D | null = null;

function getContext(): CanvasRenderingContext2D | null {
  if (context) return context;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  context = canvas.getContext("2d", { willReadFrequently: true });
  return context;
}

/** Vrai pour une couleur littérale (pas une variable, pas un mot-clé comme `inherit`). */
export function isColorLiteral(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || KEYWORDS.has(trimmed) || trimmed.includes("var(")) return false;
  return CSS.supports("color", trimmed);
}

/** Convertit une couleur CSS en RGBA en la peignant sur un pixel. */
export function parseColor(value: string): Rgba | null {
  const key = value.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  let result: Rgba | null = null;
  const ctx = getContext();
  if (ctx && isColorLiteral(key)) {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = key;
    ctx.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
    result = { r, g, b, a: Math.round((a / 255) * 100) / 100 };
  }
  cache.set(key, result);
  return result;
}

function hexPair(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0");
}

export function toHex(color: Rgba): string {
  const base = `#${hexPair(color.r)}${hexPair(color.g)}${hexPair(color.b)}`;
  return color.a >= 1 ? base : `${base}${hexPair(color.a * 255)}`;
}

/** Clé de comparaison : deux écritures de la même couleur donnent la même clé. */
export function colorKey(value: string): string | null {
  const parsed = parseColor(value);
  return parsed && parsed.a > 0 ? toHex(parsed) : null;
}

/** Luminance relative (WCAG), de 0 (noir) à 1 (blanc). */
export function luminance(color: Rgba): number {
  const channel = (value: number): number => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

/** Extrait les couleurs d'un texte collé : hex, rgb(), hsl(), oklch(), ou un lien coolors.co. */
export function parsePaletteInput(text: string): string[] {
  const coolors = /coolors\.co\/(?:palette\/)?([0-9a-f]{6}(?:-[0-9a-f]{6})+)/i.exec(text);
  if (coolors?.[1]) return coolors[1].split("-").map((hex) => `#${hex.toLowerCase()}`);
  const pattern = /#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^)]*\)/gi;
  const found = (text.match(pattern) ?? []).filter(isColorLiteral);
  return [...new Set(found.map((color) => (color.startsWith("#") ? color.toLowerCase() : color)))];
}
