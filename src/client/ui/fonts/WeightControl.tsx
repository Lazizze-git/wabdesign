import type { JSX } from "preact";
import type { FontFamily } from "../../../shared/types";
import { weightName } from "../../engine/css-value";

interface WeightControlProps {
  family: FontFamily | undefined;
  weight: number;
  italic: boolean;
  changed: boolean;
  onWeight: (weight: number) => void;
  onItalic: (italic: boolean) => void;
}

/** Graisse : curseur continu pour une police variable, sinon les graisses qui existent vraiment. */
export function WeightControl({ family, weight, italic, changed, onWeight, onItalic }: WeightControlProps): JSX.Element {
  const range = family?.faces.find((face) => face.weightRange)?.weightRange ?? null;
  const styleFaces = family?.faces.filter((face) => (face.style === "italic") === italic) ?? [];
  const weights = [...new Set((styleFaces.length > 0 ? styleFaces : (family?.faces ?? [])).map((face) => face.weight))];
  const options = family ? weights : [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const hasItalic = family ? family.faces.some((face) => face.style === "italic") : true;

  return (
    <div class="field">
      <span class="label">
        Graisse{changed && <span class="changed"> •</span>}
      </span>
      <div class="row">
        {range ? (
          <>
            <input
              type="range"
              class="grow"
              min={range[0]}
              max={range[1]}
              step={1}
              value={weight}
              onInput={(event) => onWeight(Number(event.currentTarget.value))}
              aria-label="Graisse"
            />
            <span class="mono" style="width:30px;text-align:right">{weight}</span>
          </>
        ) : (
          <select
            class="select grow"
            value={String(weight)}
            onChange={(event) => onWeight(Number(event.currentTarget.value))}
            aria-label="Graisse"
          >
            {!options.includes(weight) && <option value={String(weight)}>{weightName(weight)}</option>}
            {options.map((value) => (
              <option key={value} value={String(value)}>
                {weightName(value)}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          class="icon-btn"
          aria-pressed={italic}
          disabled={!hasItalic && !italic}
          title={hasItalic ? "Italique" : "Pas d’italique dans cette famille"}
          onClick={() => onItalic(!italic)}
          style="font-style:italic;font-family:Georgia,serif;font-size:15px"
        >
          I
        </button>
      </div>
    </div>
  );
}
