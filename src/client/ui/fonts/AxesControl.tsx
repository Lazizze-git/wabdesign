import { t, type MessageKey } from "../../i18n";
import type { JSX } from "preact";
import type { FontAxis } from "../../../shared/types";

const AXIS_NAMES: Record<string, MessageKey> = {
  wdth: "axis.wdth",
  opsz: "axis.opsz",
  slnt: "axis.slnt",
  GRAD: "axis.GRAD",
  CASL: "axis.CASL",
  SOFT: "axis.SOFT",
  MONO: "axis.MONO",
};

function axisName(tag: string): string {
  const key = AXIS_NAMES[tag];
  return key ? t(key) : tag;
}

/** « "wdth" 90, "opsz" 32 » → { wdth: 90, opsz: 32 } */
export function parseVariationSettings(value: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const match of value.matchAll(/["'](\w{4})["']\s+(-?[\d.]+)/g)) {
    if (match[1] && match[2]) result[match[1]] = Number(match[2]);
  }
  return result;
}

export function formatVariationSettings(values: Record<string, number>): string {
  const entries = Object.entries(values);
  return entries.length === 0 ? "normal" : entries.map(([tag, number]) => `"${tag}" ${number}`).join(", ");
}

interface AxesControlProps {
  axes: readonly FontAxis[];
  value: string;
  onChange: (value: string) => void;
}

/** Curseurs pour les axes d'une police variable (hors graisse, réglée à part). */
export function AxesControl({ axes, value, onChange }: AxesControlProps): JSX.Element | null {
  const extra = axes.filter((axis) => axis.tag !== "wght" && axis.tag !== "ital" && axis.min !== axis.max);
  if (extra.length === 0) return null;
  const current = parseVariationSettings(value);
  const update = (tag: string, number: number): void => onChange(formatVariationSettings({ ...current, [tag]: number }));

  return (
    <div class="stack">
      {extra.map((axis) => {
        const axisValue = current[axis.tag] ?? axis.default;
        const step = axis.max - axis.min <= 2 ? 0.01 : 1;
        return (
          <label class="field" key={axis.tag}>
            <span class="label row">
              <span class="grow">{axisName(axis.tag)}</span>
              <span class="mono">{axisValue}</span>
            </span>
            <input
              type="range"
              min={axis.min}
              max={axis.max}
              step={step}
              value={axisValue}
              onInput={(event) => update(axis.tag, Number(event.currentTarget.value))}
            />
          </label>
        );
      })}
    </div>
  );
}
