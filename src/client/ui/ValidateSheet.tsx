import type { JSX } from "preact";
import { useState } from "preact/hooks";
import type { ValidateEvent, ValidateMode } from "../../shared/types";
import { validate } from "../api";
import { t, tn } from "../i18n";
import { changes, clearChanges } from "../state/changes";
import { status } from "../state/library";
import { Icon } from "./icons";

type Phase = "choose" | "running" | "done" | "error";

/** Validation : Claude Code reporte les modifications dans le vrai code du projet. */
export function ValidateSheet({ onClose }: { onClose: () => void }): JSX.Element {
  const [phase, setPhase] = useState<Phase>("choose");
  const [log, setLog] = useState<ValidateEvent[]>([]);
  const claude = status.value?.claudeAvailable ?? false;
  const count = changes.value.length;

  const run = async (mode: ValidateMode): Promise<void> => {
    setPhase("running");
    setLog([]);
    let finished = "error" as Phase;
    try {
      await validate(changes.value, mode, (event) => {
        setLog((current) => [...current, event]);
        if (event.type === "done") finished = "done";
      });
      if (finished === "done" && mode === "claude") clearChanges();
    } catch (error) {
      setLog((current) => [...current, { type: "error", message: error instanceof Error ? error.message : t("common.unknownError") }]);
    }
    setPhase(finished);
  };

  return (
    <div class="sheet">
      <div class="sheet-head">
        <button type="button" class="icon-btn" onClick={onClose} disabled={phase === "running"} aria-label={t("common.back")}>
          <Icon name="back" />
        </button>
        <span class="section-title">{tn(count, "validate.title.one", "validate.title.other")}</span>
      </div>
      <div class="body section stack">
        {phase === "choose" && (
          <>
            <p class="hint">{t("validate.intro")}</p>
            <button type="button" class="btn btn-primary btn-block" disabled={!claude} onClick={() => void run("claude")}>
              <Icon name="check" size={14} /> {t("validate.apply")}
            </button>
            {!claude && <p class="hint">{t("validate.noClaude")}</p>}
            <button type="button" class="btn btn-block" onClick={() => void run("export")}>
              {t("validate.exportOnly")}
            </button>
            <p class="hint">{t("validate.exportHint")}</p>
          </>
        )}
        {phase !== "choose" && (
          <div class="log" aria-live="polite">
            {log.map((event, index) => (
              <div key={index} class={`log-line ${event.type}`}>
                {event.message}
              </div>
            ))}
            {phase === "running" && <div class="log-line">{t("validate.running")}</div>}
          </div>
        )}
        {(phase === "done" || phase === "error") && (
          <button type="button" class="btn btn-block" onClick={onClose}>
            {t("common.close")}
          </button>
        )}
      </div>
    </div>
  );
}
