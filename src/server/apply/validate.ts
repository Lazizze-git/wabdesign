import { writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { Change, Language, ValidateEvent, ValidateMode } from "../../shared/types";
import type { FontService } from "../fonts/font-service";
import type { FaceRecord } from "../fonts/read-font";
import { describeError, msg, tm } from "../i18n";
import { logger } from "../logger";
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
  language: Language,
): Promise<void> {
  if (running) {
    emit({ type: "error", message: msg(language, "validateBusy") });
    return;
  }
  running = true;
  try {
    const now = new Date();
    const dir = await ensureProjectDir(projectDir);
    const base = join(dir, `changes-${stamp(now)}`);
    const brief = buildBrief(changes, localFontFiles(changes, fonts), now, language);
    await writeFile(`${base}.md`, brief, "utf8");
    await writeFile(`${base}.json`, `${JSON.stringify(changes, null, 2)}\n`, "utf8");
    const file = relative(projectDir, `${base}.md`);
    emit({ type: "step", message: msg(language, "briefSaved", { file }) });
    if (mode === "export") {
      emit({ type: "done", message: msg(language, "exportDone"), file });
      return;
    }
    emit({ type: "step", message: msg(language, "claudeApplying") });
    logger.info(tm("validateLog", { file }));
    const prompt = msg(language, "claudePrompt", { file });
    const summary = await runClaude(prompt, projectDir, language, {
      onStep: (message) => {
        logger.detail(message);
        emit({ type: "step", message });
      },
    });
    emit({ type: "done", message: summary || msg(language, "validateDone"), file });
    logger.info(tm("validateDoneLog"));
  } catch (error) {
    logger.error(tm("validateFailedLog"), error);
    emit({ type: "error", message: describeError(error, language) });
  } finally {
    running = false;
  }
}
