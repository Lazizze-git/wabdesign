import type { JSX } from "preact";
import { t } from "../i18n";
import { updateConfig } from "../state/library";
import { Icon } from "./icons";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const SEEN_KEY = "outil-design:welcomed";

/** Vu dans ce navigateur (au cas où le serveur, plus ancien, n’enregistrerait pas le réglage). */
export function welcomeSeenLocally(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Stockage indisponible : le réglage serveur suffit.
  }
  void updateConfig((current) => ({ ...current, onboarded: true }));
}

/** Introduction du premier lancement : trois phrases, puis on n’en parle plus. */
export function Welcome({ onClose }: { onClose: () => void }): JSX.Element {
  const steps = [
    t("welcome.try", { pick: IS_MAC ? "⌥ S" : "Alt S" }),
    t("welcome.safe", { undo: IS_MAC ? "⌘ Z" : "Ctrl Z" }),
    t("welcome.apply"),
  ];
  const close = (): void => {
    markSeen();
    onClose();
  };
  return (
    <div class="sheet welcome" role="dialog" aria-labelledby="od-welcome-title">
      <div class="body section stack">
        <h2 id="od-welcome-title" class="welcome-title">
          {t("welcome.title")}
        </h2>
        <ol class="welcome-steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <button type="button" class="btn btn-primary btn-block" onClick={close}>
          <Icon name="check" size={14} /> {t("welcome.start")}
        </button>
      </div>
    </div>
  );
}
