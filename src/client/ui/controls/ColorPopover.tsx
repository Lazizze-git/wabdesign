import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { parseColor, toHex } from "../../engine/colors";
import { config } from "../../state/library";
import { Swatch } from "./Swatch";

interface ColorPopoverProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onReset?: () => void;
}

/** Choix d'une couleur : couleurs de mes palettes, pipette du système, ou saisie libre. */
export function ColorPopover({ value, onChange, onClose, onReset }: ColorPopoverProps): JSX.Element {
  // null = on n'est pas en train de taper : le champ affiche toujours la couleur réelle.
  const [draft, setDraft] = useState<string | null>(null);
  const parsed = parseColor(value);
  const hex = parsed ? toHex({ ...parsed, a: 1 }) : "#000000";
  const palettes = config.value?.palettes ?? [];

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const commitDraft = (event: Event): void => {
    const text = (event.currentTarget as HTMLInputElement).value.trim();
    setDraft(null);
    if (text !== value && parseColor(text)) onChange(text);
  };

  return (
    <>
      <button type="button" class="backdrop" tabIndex={-1} aria-label="Fermer le choix de couleur" onClick={onClose} />
      <div class="popover stack" role="dialog" aria-label="Choisir une couleur">
        <div class="row">
          <input
            type="color"
            value={hex}
            onInput={(event) => onChange(event.currentTarget.value)}
            style="width:36px;height:28px;border:0;padding:0;background:none"
            aria-label="Pipette"
          />
          <input
            class="input mono grow"
            value={draft ?? value}
            onInput={(event) => setDraft(event.currentTarget.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => event.key === "Enter" && commitDraft(event)}
            aria-label="Valeur de la couleur"
          />
          {onReset && (
            <button type="button" class="btn btn-ghost" onClick={onReset}>
              Rétablir
            </button>
          )}
        </div>
        {palettes.length === 0 && <p class="hint">Crée une palette dans l’onglet Couleurs pour l’avoir ici.</p>}
        {palettes.map((palette) => (
          <div key={palette.id} class="field">
            <span class="label">{palette.name}</span>
            <div class="swatch-row">
              {palette.colors.map((color) => (
                <button type="button" class="swatch-btn" key={color} title={color} onClick={() => onChange(color)}>
                  <Swatch color={color} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
