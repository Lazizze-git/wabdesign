import type { JSX } from "preact";
import { t } from "../../i18n";
import { Icon } from "../icons";

/** Petit bouton ↺ à côté d’un réglage modifié : le remet à sa valeur d’origine, lui seul. */
export function ResetButton({ onReset, label }: { onReset: () => void; label: string }): JSX.Element {
  return (
    <button
      type="button"
      class="reset-btn"
      title={t("field.reset", { name: label })}
      aria-label={t("field.reset", { name: label })}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onReset();
      }}
    >
      <Icon name="undo" size={12} />
    </button>
  );
}
