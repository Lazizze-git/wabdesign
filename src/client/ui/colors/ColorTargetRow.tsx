import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { colorKey } from "../../engine/colors";
import { armedColor } from "../../state/palettes";
import { ColorPopover } from "../controls/ColorPopover";
import { Swatch } from "../controls/Swatch";

interface ColorTargetRowProps {
  label: string;
  /** Deuxième ligne : nom technique, nombre d’usages… */
  sublabel: string;
  /** Affiche la valeur de la couleur à droite (inutile quand le libellé est déjà la valeur). */
  showValue?: boolean;
  original: string;
  current: string | null;
  onApply: (value: string) => void;
  onReset: () => void;
}

/**
 * Une couleur du site qu'on peut remplacer : clic (avec une couleur de palette en main),
 * glisser-déposer d'une pastille, ou choix libre dans le sélecteur.
 */
export function ColorTargetRow(props: ColorTargetRowProps): JSX.Element {
  const { label, sublabel, showValue = true, original, current, onApply, onReset } = props;
  const [open, setOpen] = useState(false);
  const [dropping, setDropping] = useState(false);

  const onClick = (): void => {
    const armed = armedColor.value;
    if (armed) {
      onApply(armed);
      return;
    }
    setOpen(!open);
  };

  const onDrop = (event: DragEvent): void => {
    event.preventDefault();
    setDropping(false);
    const color = event.dataTransfer?.getData("text/plain");
    if (color && colorKey(color)) onApply(color);
  };

  return (
    <div>
      <button
        type="button"
        class={`color-row${armedColor.value || dropping ? " target" : ""}`}
        onClick={onClick}
        onDragOver={(event) => {
          event.preventDefault();
          setDropping(true);
        }}
        onDragLeave={() => setDropping(false)}
        onDrop={onDrop}
      >
        <Swatch color={original} />
        {current && (
          <>
            <span class="arrow">→</span>
            <Swatch color={current} />
          </>
        )}
        <span class="grow color-text">
          <span class="truncate color-label">{label}</span>
          <span class="truncate color-sub">{sublabel}</span>
        </span>
        {showValue && <span class="mono">{colorKey(current ?? original) ?? ""}</span>}
      </button>
      {open && (
        <ColorPopover
          value={current ?? original}
          onChange={onApply}
          onClose={() => setOpen(false)}
          onReset={current ? () => (onReset(), setOpen(false)) : undefined}
        />
      )}
    </div>
  );
}
