import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";

/** Réglages personnels, partagés entre tous les projets (dossier modifiable pour les tests). */
export const CONFIG_DIR = process.env["OUTIL_DESIGN_CONFIG_DIR"] ?? join(homedir(), ".config", "outil-design");
export const CONFIG_FILE = join(CONFIG_DIR, "config.json");
export const FONT_CACHE_FILE = join(CONFIG_DIR, "font-cache.json");
export const GOOGLE_CACHE_FILE = join(CONFIG_DIR, "google-fonts.json");

/** Dossier propre au projet ouvert (ignoré par git grâce à son propre .gitignore). */
export function projectStateDir(projectDir: string): string {
  return join(projectDir, ".design-tool");
}

/** Racine Google Drive synchronisée sur le Mac, si l'app Google Drive est installée. */
export function findDriveRoot(): string | null {
  const cloud = join(homedir(), "Library", "CloudStorage");
  if (!existsSync(cloud)) return null;
  try {
    const account = readdirSync(cloud).find((name) => name.startsWith("GoogleDrive-"));
    if (!account) return null;
    const root = join(cloud, account);
    const myDrive = ["Mon Drive", "My Drive"].map((name) => join(root, name)).find(existsSync);
    return myDrive ?? root;
  } catch {
    return null;
  }
}
