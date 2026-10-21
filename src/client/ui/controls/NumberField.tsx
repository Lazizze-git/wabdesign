import { ResetButton } from "./ResetButton";
import { t } from "../../i18n";
import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import { formatLength, isValidCss, parseLength, roundTo } from "../../engine/css-value";

interface NumberFieldProps {
  label: string;
  property: string;
  value: string;
  units: readonly string[];
  step?: number;
  min?: number;
  max?: number;
  changed?: boolean;
  /** Nom technique affiché discrètement à droite du libellé (ex. --radius). */
  code?: string;
  /** Affiche ↺ quand le réglage est modifié, pour revenir à la valeur d’origine. */
  onReset?: () => void;
  onChange: (value: string) => void;
}

function clamp(value: number, min: number | undefined, max: number | undefined): number {
  return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value));
}

/**
 * Champ numérique façon Figma : on tape une valeur, on utilise les flèches (Maj = ×10),
 * ou on fait glisser l'étiquette vers la gauche ou la droite.
 */
export function NumberField(props: NumberFieldProps): JSX.Element {
  const { label, property, value, units, step = 1, min, max, changed = false, code, onReset, onChange } = props;
  const parsed = parseLength(value);
  const shown = parsed ? String(roundTo(parsed.value, parsed.unit === "px" || parsed.unit === "" ? 2 : 3)) : value;
  // null = on n'est pas en train de taper : le champ affiche toujours la valeur réelle.
  const [draft, setDraft] = useState<string | null>(null);
  const scrub = useRef<{ x: number; start: number; unit: string } | null>(null);
  const unit = parsed && units.includes(parsed.unit) ? parsed.unit : (units[0] ?? "");

  const emit = (next: number, nextUnit: string): void => {
    onChange(formatLength({ value: clamp(next, min, max), unit: nextUnit }));
  };

  // On lit le champ lui-même : l'état peut avoir un temps de retard si on tape puis valide très vite.
  const commit = (event: Event): void => {
    const text = (event.currentTarget as HTMLInputElement).value.trim();
    setDraft(null);
    if (text === shown) return;
    const length = parseLength(text);
    if (length) emit(length.value, length.unit || unit);
    else if (isValidCss(property, text)) onChange(text);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const input = event.currentTarget as HTMLInputElement;
    if (event.key === "Enter") input.blur();
    if (event.key === "Escape") {
      input.value = shown;
      input.blur();
    }
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    setDraft(null);
    const delta = (event.key === "ArrowUp" ? step : -step) * (event.shiftKey ? 10 : 1);
    emit((parsed?.value ?? 0) + delta, unit);
  };

  const onPointerDown = (event: PointerEvent): void => {
    scrub.current = { x: event.clientX, start: parsed?.value ?? 0, unit };
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent): void => {
    const state = scrub.current;
    if (!state) return;
    const steps = Math.round((event.clientX - state.x) / 2);
    emit(state.start + steps * step * (event.shiftKey ? 10 : 1), state.unit);
  };
  const onPointerUp = (): void => {
    scrub.current = null;
  };

  const cycleUnit = (): void => {
    const next = units[(units.indexOf(unit) + 1) % units.length] ?? unit;
    if (parsed) emit(parsed.value, next);
  };

  return (
    <label class="field">
      <span
        class="label scrub"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span class="label-row">
          <span class="truncate">
            {label}
            {changed && <span class="changed"> •</span>}
          </span>
          {changed && onReset && <ResetButton onReset={onReset} label={label} />}
          {code && <span class="label-code">{code}</span>}
        </span>
      </span>
      <span class="unit-input">
        <input
          class="input mono"
          value={draft ?? shown}
          inputMode="decimal"
          onInput={(event) => setDraft(event.currentTarget.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
        {parsed && (units.length > 1 || unit !== "") && (
          <button type="button" class="unit" onClick={cycleUnit} title={t("field.unit")}>
            {unit || t("field.ratio")}
          </button>
        )}
      </span>
    </label>
  );
}
