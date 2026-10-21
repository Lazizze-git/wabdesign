import { z } from "zod";
import type { FontAxis, FontFaceInfo, FontFamily } from "../../shared/types";
import { LocalizedError } from "../i18n";
import { readJson, writeJson } from "../json-file";
import { GOOGLE_CACHE_FILE } from "../paths";

const METADATA_URL = "https://fonts.google.com/metadata/fonts";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const metadataSchema = z.object({
  familyMetadataList: z.array(
    z.object({
      family: z.string(),
      category: z.string().nullable().optional(),
      popularity: z.number().optional(),
      fonts: z.record(z.string(), z.unknown()),
      axes: z
        .array(z.object({ tag: z.string(), min: z.number(), max: z.number(), defaultValue: z.number() }))
        .optional(),
    }),
  ),
});
type GoogleMetadata = z.infer<typeof metadataSchema>;
type GoogleEntry = GoogleMetadata["familyMetadataList"][number];

const cacheSchema = z.object({ fetchedAt: z.number(), families: z.array(z.custom<FontFamily>()) });

/** "400" → normal 400, "700i" → italic 700. */
export function parseGoogleFaceKey(key: string): Pick<FontFaceInfo, "weight" | "style"> | null {
  const match = /^(\d{3})(i?)$/.exec(key);
  if (!match?.[1]) return null;
  return { weight: Number(match[1]), style: match[2] ? "italic" : "normal" };
}

export function toFontFamily(entry: GoogleEntry): FontFamily {
  const axes: FontAxis[] = (entry.axes ?? []).map((axis) => ({
    tag: axis.tag,
    min: axis.min,
    max: axis.max,
    default: axis.defaultValue,
  }));
  const wght = axes.find((axis) => axis.tag === "wght");
  const faces = Object.keys(entry.fonts).flatMap((key): FontFaceInfo[] => {
    const parsed = parseGoogleFaceKey(key);
    if (!parsed) return [];
    const weightRange: [number, number] | null = wght ? [wght.min, wght.max] : null;
    return [{ id: `${entry.family}:${key}`, ...parsed, weightRange, axes }];
  });
  faces.sort((a, b) => a.weight - b.weight || a.style.localeCompare(b.style));
  return {
    key: `google:${entry.family.toLowerCase()}`,
    family: entry.family,
    source: "google",
    category: entry.category ?? null,
    origin: "Google Fonts",
    faces,
  };
}

async function download(): Promise<FontFamily[]> {
  const response = await fetch(METADATA_URL, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new LocalizedError("googleStatus", { status: response.status });
  const text = (await response.text()).replace(/^\)\]\}'\s*/, "");
  const metadata = metadataSchema.parse(JSON.parse(text));
  return [...metadata.familyMetadataList]
    .sort((a, b) => (a.popularity ?? Infinity) - (b.popularity ?? Infinity))
    .map(toFontFamily);
}

/** Catalogue Google Fonts, gardé en cache une semaine (et réutilisé hors connexion). */
export async function loadGoogleFonts(): Promise<FontFamily[]> {
  const cached = await readJson(GOOGLE_CACHE_FILE, cacheSchema, { fetchedAt: 0, families: [] });
  if (cached.families.length > 0 && Date.now() - cached.fetchedAt < MAX_AGE_MS) return cached.families;
  try {
    const families = await download();
    await writeJson(GOOGLE_CACHE_FILE, { fetchedAt: Date.now(), families });
    return families;
  } catch (error) {
    if (cached.families.length > 0) return cached.families;
    throw error;
  }
}
