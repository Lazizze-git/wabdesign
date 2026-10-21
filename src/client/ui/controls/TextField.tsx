import { ResetButton } from "./ResetButton";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { isSafeCss } from "../../../shared/css";

interface TextFieldProps {
  label: string;
  value: string;
  changed?: boolean;
  /** Nom technique affiché discrètement à droite du libellé. */
  code?: string;
  onReset?: () => void;
  onChange: (value: string) => void;
}

/** Valeur CSS libre (ombre, durée, calc()…), enregistrée quand on valide ou quitte le champ. */
export function TextField({ label, value, changed = false, code, onReset, onChange }: TextFieldProps): JSX.Element {
  // null = pas de saisie en cours : le champ affiche toujours la valeur réelle.
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (event: Event): void => {
    const text = (event.currentTarget as HTMLInputElement).value.trim();
    setDraft(null);
    if (text && text !== value && isSafeCss(text)) onChange(text);
  };

  return (
    <label class="field">
      <span class="label label-row">
        <span class="truncate">
          {label}
          {changed && <span class="changed"> •</span>}
        </span>
        {changed && onReset && <ResetButton onReset={onReset} label={label} />}
        {code && <span class="label-code">{code}</span>}
      </span>
      <input
        class="input mono"
        value={draft ?? value}
        onInput={(event) => setDraft(event.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            event.currentTarget.value = value;
            event.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}
