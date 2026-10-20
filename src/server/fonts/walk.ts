import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { FONT_EXTENSIONS } from "./read-font";

export interface FontFileEntry {
  path: string;
  mtimeMs: number;
  size: number;
}

const MAX_DEPTH = 8;
const MAX_FILES = 8000;
const SKIPPED = new Set(["node_modules", "__MACOSX"]);

function isFontFile(name: string): boolean {
  const lower = name.toLowerCase();
  return FONT_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

/** Parcourt un dossier (et ses sous-dossiers) à la recherche de fichiers de police. */
export async function walkFontFiles(root: string): Promise<FontFileEntry[]> {
  const found: FontFileEntry[] = [];
  async function visit(dir: string, depth: number): Promise<void> {
    if (depth > MAX_DEPTH || found.length >= MAX_FILES) return;
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || SKIPPED.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(path, depth + 1);
      } else if (entry.isFile() && isFontFile(entry.name)) {
        const info = await stat(path);
        found.push({ path, mtimeMs: info.mtimeMs, size: info.size });
        if (found.length >= MAX_FILES) return;
      }
    }
  }
  await visit(root, 0);
  return found;
}
