import { writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { Change, ValidateEvent, ValidateMode } from "../../shared/types";
import type { FontService } from "../fonts/font-service";
import type { FaceRecord } from "../fonts/read-font";
import { errorMessage, logger } from "../logger";
import { ensureProjectDir } from "../stores";
import { buildBrief } from "./brief";
import { runClaude } from "./claude-runner";

let running = false;

function localFontFiles(changes: readonly Change[], fonts: FontService): Map<string, FaceRecord[]> {
  const result = new Map<string, FaceRecord[]>();
  for (const change of changes) {
    if (change.font?.source !== "local" || result.has(change.font.family)) continue;
    result.set(change.font.family, fonts.filesOf(change.font.family));
  }
  return result;
}

function stamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

/** Enregistre la fiche des modifications, puis (si demandé) laisse Claude Code l'appliquer. */
export async function validateChanges(
  projectDir: string,
  changes: readonly Change[],
  mode: ValidateMode,
  fonts: FontService,
  emit: (event: ValidateEvent) => void,
): Promise<void> {
  if (running) {
    emit({ type: "error", message: "Une validation est déjà en cours." });
    return;
  }
  running = true;
  try {
    const now = new Date();
    const dir = await ensureProjectDir(projectDir);
    const base = join(dir, `changes-${stamp(now)}`);
    const brief = buildBrief(changes, localFontFiles(changes, fonts), now);
    await writeFile(`${base}.md`, brief, "utf8");
    await writeFile(`${base}.json`, `${JSON.stringify(changes, null, 2)}\n`, "utf8");
    const file = relative(projectDir, `${base}.md`);
    emit({ type: "step", message: `Fiche enregistrée : ${file}` });
    if (mode === "export") {
      emit({ type: "done", message: "Fiche prête. Demande à Claude Code de l’appliquer.", file });
      return;
    }
    emit({ type: "step", message: "Claude Code applique les modifications dans le code…" });
    logger.info(`Application des modifications par Claude Code (${file})`);
    const prompt = `Lis le fichier ${file} et applique dans le code source de ce projet les modifications de design qu’il décrit, en suivant ses consignes à la lettre.`;
    const summary = await runClaude(prompt, projectDir, {
      onStep: (message) => {
        logger.detail(message);
        emit({ type: "step", message });
      },
    });
    emit({ type: "done", message: summary || "Modifications appliquées.", file });
    logger.info("Modifications appliquées dans le code.");
  } catch (error) {
    logger.error("La validation a échoué", error);
    emit({ type: "error", message: errorMessage(error) });
  } finally {
    running = false;
  }
}
