import { open, type Font } from "fontkit";
import type { FontAxis, FontStyle } from "../../shared/types";

/** Ce qu'on retient d'un fichier de police. */
export interface FaceRecord {
  path: string;
  family: string;
  weight: number;
  weightRange: [number, number] | null;
  style: FontStyle;
  axes: FontAxis[];
  format: string;
}

const FORMATS: Record<string, string> = {
  ".woff2": "woff2",
  ".woff": "woff",
  ".ttf": "truetype",
  ".otf": "opentype",
};

export const FONT_EXTENSIONS: readonly string[] = Object.keys(FORMATS);

function extensionOf(path: string): string {
  const dot = path.lastIndexOf(".");
  return dot === -1 ? "" : path.slice(dot).toLowerCase();
}

function familyOf(font: Font): string {
  const preferred = font.getName("preferredFamily", "en");
  return (preferred ?? font.familyName).trim();
}

function styleOf(font: Font): FontStyle {
  const subfamily = (font.getName("preferredSubfamily", "en") ?? font.subfamilyName).toLowerCase();
  const os2 = font["OS/2"];
  const italic = os2.fsSelection.italic || os2.fsSelection.oblique || font.italicAngle !== 0;
  return italic || /italic|oblique/.test(subfamily) ? "italic" : "normal";
}

function axesOf(font: Font): FontAxis[] {
  return Object.entries(font.variationAxes).flatMap(([tag, axis]) =>
    axis ? [{ tag, min: axis.min, max: axis.max, default: axis.default }] : [],
  );
}

/** Ouvre un fichier de police et en extrait famille, graisse, style et axes variables. */
export async function readFont(path: string): Promise<FaceRecord | null> {
  const format = FORMATS[extensionOf(path)];
  if (!format) return null;
  const opened = await open(path);
  if (!("familyName" in opened)) return null;
  const axes = axesOf(opened);
  const wght = axes.find((axis) => axis.tag === "wght");
  return {
    path,
    family: familyOf(opened),
    weight: wght ? wght.default : opened["OS/2"].usWeightClass || 400,
    weightRange: wght ? [wght.min, wght.max] : null,
    style: styleOf(opened),
    axes,
    format,
  };
}
