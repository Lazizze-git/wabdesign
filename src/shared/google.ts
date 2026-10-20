import type { FontAxis, FontFamily } from "./types";

const CSS2 = "https://fonts.googleapis.com/css2";

function familyParam(family: string): string {
  return encodeURIComponent(family).replace(/%20/g, "+");
}

/** Google exige les axes en minuscules (ordre alphabétique) avant les axes en majuscules. */
export function sortAxisTags(tags: readonly string[]): string[] {
  const isLower = (tag: string): boolean => tag === tag.toLowerCase();
  return [...tags].sort((a, b) => {
    if (isLower(a) !== isLower(b)) return isLower(a) ? -1 : 1;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

function axisRange(axis: FontAxis): string {
  return axis.min === axis.max ? `${axis.min}` : `${axis.min}..${axis.max}`;
}

function variableSpec(axes: readonly FontAxis[], hasItalic: boolean): string {
  const tags = sortAxisTags(axes.map((axis) => axis.tag));
  const ranges = tags.map((tag) => {
    const axis = axes.find((candidate) => candidate.tag === tag);
    return axis ? axisRange(axis) : "";
  });
  if (!hasItalic) return `${tags.join(",")}@${ranges.join(",")}`;
  const tuples = [0, 1].map((ital) => [String(ital), ...ranges].join(","));
  return `ital,${tags.join(",")}@${tuples.join(";")}`;
}

function staticSpec(family: FontFamily): string {
  const italics = family.faces.some((face) => face.style === "italic");
  const tuples = family.faces
    .map((face) => ({ ital: face.style === "italic" ? 1 : 0, weight: face.weight }))
    .sort((a, b) => a.ital - b.ital || a.weight - b.weight);
  if (!italics) return `wght@${[...new Set(tuples.map((t) => t.weight))].join(";")}`;
  return `ital,wght@${tuples.map((t) => `${t.ital},${t.weight}`).join(";")}`;
}

/** URL de la feuille Google Fonts qui charge toutes les graisses et tous les axes d'une famille. */
export function googleFamilyUrl(family: FontFamily): string {
  const axes = family.faces[0]?.axes ?? [];
  const hasItalic = family.faces.some((face) => face.style === "italic");
  const spec = axes.length > 0 ? variableSpec(axes, hasItalic) : staticSpec(family);
  return `${CSS2}?family=${familyParam(family.family)}:${spec}&display=swap`;
}

/** URL légère qui ne charge que les lettres du nom, pour l'aperçu dans la liste. */
export function googlePreviewUrl(family: string): string {
  return `${CSS2}?family=${familyParam(family)}&text=${encodeURIComponent(family)}&display=block`;
}
