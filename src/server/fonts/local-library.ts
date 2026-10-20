import { createHash } from "node:crypto";
import { basename } from "node:path";
import { z } from "zod";
import type { FontFamily } from "../../shared/types";
import { readJson, writeJson } from "../json-file";
import { errorMessage } from "../logger";
import { FONT_CACHE_FILE } from "../paths";
import { readFont, type FaceRecord } from "./read-font";
import { walkFontFiles, type FontFileEntry } from "./walk";

const axisSchema = z.object({ tag: z.string(), min: z.number(), max: z.number(), default: z.number() });
const cacheSchema = z.record(
  z.string(),
  z.object({
    mtimeMs: z.number(),
    size: z.number(),
    face: z
      .object({
        path: z.string(),
        family: z.string(),
        weight: z.number(),
        weightRange: z.tuple([z.number(), z.number()]).nullable(),
        style: z.enum(["normal", "italic"]),
        axes: z.array(axisSchema),
        format: z.string(),
      })
      .nullable(),
  }),
);
type FontCache = z.infer<typeof cacheSchema>;

export interface LocalScan {
  families: FontFamily[];
  files: Map<string, FaceRecord>;
  errors: string[];
}

export function faceId(path: string): string {
  return createHash("sha1").update(path).digest("hex").slice(0, 16);
}

async function readFace(entry: FontFileEntry, cache: FontCache, errors: string[]): Promise<FaceRecord | null> {
  const cached = cache[entry.path];
  if (cached && cached.mtimeMs === entry.mtimeMs && cached.size === entry.size) return cached.face;
  let face: FaceRecord | null = null;
  try {
    face = await readFont(entry.path);
  } catch (error) {
    errors.push(`${basename(entry.path)} : fichier de police illisible (${errorMessage(error)})`);
  }
  cache[entry.path] = { mtimeMs: entry.mtimeMs, size: entry.size, face };
  return face;
}

function addFace(families: Map<string, FontFamily>, face: FaceRecord, origin: string): void {
  const key = `local:${face.family.toLowerCase()}`;
  const family = families.get(key) ?? { key, family: face.family, source: "local", category: null, origin, faces: [] };
  const duplicate = family.faces.some((f) => f.weight === face.weight && f.style === face.style);
  if (!duplicate) {
    family.faces.push({
      id: faceId(face.path),
      weight: face.weight,
      weightRange: face.weightRange,
      style: face.style,
      axes: face.axes,
    });
  }
  families.set(key, family);
}

/** Lit tous les dossiers de polices configurés et regroupe les fichiers par famille. */
export async function scanLocalFonts(folders: readonly string[]): Promise<LocalScan> {
  const cache = await readJson(FONT_CACHE_FILE, cacheSchema, {});
  const families = new Map<string, FontFamily>();
  const files = new Map<string, FaceRecord>();
  const errors: string[] = [];
  for (const folder of folders) {
    let entries: FontFileEntry[];
    try {
      entries = await walkFontFiles(folder);
    } catch (error) {
      errors.push(`Dossier inaccessible : ${folder} (${errorMessage(error)})`);
      continue;
    }
    for (const entry of entries) {
      const face = await readFace(entry, cache, errors);
      if (!face) continue;
      files.set(faceId(face.path), face);
      addFace(families, face, basename(folder));
    }
  }
  await writeJson(FONT_CACHE_FILE, cache).catch((error: unknown) => {
    errors.push(`Cache des polices non enregistré (${errorMessage(error)})`);
  });
  const sorted = [...families.values()].sort((a, b) => a.family.localeCompare(b.family));
  for (const family of sorted) family.faces.sort((a, b) => a.weight - b.weight || a.style.localeCompare(b.style));
  return { families: sorted, files, errors };
}
