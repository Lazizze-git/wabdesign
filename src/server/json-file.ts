import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { z } from "zod";
import { errorMessage, logger } from "./logger";

/** Lit un fichier JSON et le valide ; renvoie `fallback` s'il est absent ou invalide. */
export async function readJson<T>(file: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch {
    return fallback;
  }
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
    logger.warn(`Fichier ignoré car invalide : ${file}`);
  } catch (error) {
    logger.warn(`Fichier illisible : ${file} (${errorMessage(error)})`);
  }
  return fallback;
}

/** Écriture atomique : on écrit à côté puis on renomme, pour ne jamais laisser un fichier à moitié écrit. */
export async function writeJson(file: string, data: unknown): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await rename(temp, file);
}
