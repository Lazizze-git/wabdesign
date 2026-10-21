import { execFile } from "node:child_process";
import { copyFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tm } from "./i18n";
import { logger } from "./logger";

const SKILL_SOURCE = fileURLToPath(new URL("../skill/SKILL.md", import.meta.url));

/** Installe la commande /wabdesign dans Claude Code (dossier des skills de l’utilisateur). */
export async function installSkill(): Promise<void> {
  const target = join(homedir(), ".claude", "skills", "wabdesign");
  await mkdir(target, { recursive: true });
  await copyFile(SKILL_SOURCE, join(target, "SKILL.md"));
  logger.info(tm("skillInstalled", { path: target }));
  logger.detail(tm("skillNext"));
}

/** Ouvre une adresse dans le navigateur par défaut, quel que soit le système. */
export function openInBrowser(url: string): void {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  execFile(command, args, (error) => {
    if (error) logger.detail(tm("openManually", { url }));
  });
}
