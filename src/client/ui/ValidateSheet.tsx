import type { JSX } from "preact";
import { useState } from "preact/hooks";
import type { ValidateEvent, ValidateMode } from "../../shared/types";
import { validate } from "../api";
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
      setLog((current) => [...current, { type: "error", message: error instanceof Error ? error.message : "Erreur inconnue" }]);
    }
    setPhase(finished);
  };

  return (
    <div class="sheet">
      <div class="sheet-head">
        <button type="button" class="icon-btn" onClick={onClose} disabled={phase === "running"} aria-label="Retour">
          <Icon name="back" />
        </button>
        <span class="section-title">Valider {count} modification{count > 1 ? "s" : ""}</span>
      </div>
      <div class="body section stack">
        {phase === "choose" && (
          <>
            <p class="hint">
              Claude Code va reporter ces modifications dans le code du projet, au bon endroit (variables, thème, composants), et copier
              les polices locales utilisées. Tu peux suivre son travail ici.
            </p>
            <button type="button" class="btn btn-primary btn-block" disabled={!claude} onClick={() => void run("claude")}>
              <Icon name="check" size={14} /> Appliquer dans le code
            </button>
            {!claude && <p class="hint">Claude Code est introuvable sur ce Mac : seule la fiche peut être enregistrée.</p>}
            <button type="button" class="btn btn-block" onClick={() => void run("export")}>
              Enregistrer seulement la fiche
            </button>
            <p class="hint">La fiche (dossier .design-tool du projet) décrit chaque modification ; tu pourras la donner à Claude plus tard.</p>
          </>
        )}
        {phase !== "choose" && (
          <div class="log" aria-live="polite">
            {log.map((event, index) => (
              <div key={index} class={`log-line ${event.type}`}>
                {event.message}
              </div>
            ))}
            {phase === "running" && <div class="log-line">En cours… (ça peut prendre une minute)</div>}
          </div>
        )}
        {(phase === "done" || phase === "error") && (
          <button type="button" class="btn btn-block" onClick={onClose}>
            Fermer
          </button>
        )}
      </div>
    </div>
  );
}
