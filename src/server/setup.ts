import { execFile } from "node:child_process";
import { copyFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "./logger";

const SKILL_SOURCE = fileURLToPath(new URL("../skill/SKILL.md", import.meta.url));

/** Installe la commande /wabdesign dans Claude Code (dossier des skills de l’utilisateur). */
export async function installSkill(): Promise<void> {
  const target = join(homedir(), ".claude", "skills", "wabdesign");
  await mkdir(target, { recursive: true });
  await copyFile(SKILL_SOURCE, join(target, "SKILL.md"));
  logger.info(`Commande /wabdesign installée dans Claude Code (${target})`);
  logger.detail("Ouvre une nouvelle conversation Claude Code puis tape /wabdesign dans ton projet.");
}

/** Ouvre une adresse dans le navigateur par défaut, quel que soit le système. */
export function openInBrowser(url: string): void {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  execFile(command, args, (error) => {
    if (error) logger.detail(`Ouvre cette adresse dans ton navigateur : ${url}`);
  });
}
