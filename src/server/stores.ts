import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { configSchema, DEFAULT_CONFIG, sessionSchema } from "../shared/schemas";
import type { Config, Session } from "../shared/types";
import { readJson, writeJson } from "./json-file";
import { CONFIG_FILE, projectStateDir } from "./paths";

export async function loadConfig(): Promise<Config> {
  return readJson(CONFIG_FILE, configSchema, DEFAULT_CONFIG);
}

export async function saveConfig(config: Config): Promise<void> {
  await writeJson(CONFIG_FILE, config);
}

/** Prépare le dossier .design-tool du projet, auto-ignoré par git. */
export async function ensureProjectDir(projectDir: string): Promise<string> {
  const dir = projectStateDir(projectDir);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, ".gitignore"), "*\n", { flag: "w" });
  return dir;
}

export async function loadSession(projectDir: string): Promise<Session> {
  return readJson(join(projectStateDir(projectDir), "session.json"), sessionSchema, { changes: [] });
}

export async function saveSession(projectDir: string, session: Session): Promise<void> {
  const dir = await ensureProjectDir(projectDir);
  await writeJson(join(dir, "session.json"), session);
}
