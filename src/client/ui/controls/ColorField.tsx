import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { colorKey } from "../../engine/colors";
import { ColorPopover } from "./ColorPopover";
import { Swatch } from "./Swatch";

interface ColorFieldProps {
  label: string;
  value: string;
  changed?: boolean;
  onChange: (value: string) => void;
  onReset?: () => void;
}

export function ColorField({ label, value, changed = false, onChange, onReset }: ColorFieldProps): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div class="field">
      <span class="label">
        {label}
        {changed && <span class="changed"> •</span>}
      </span>
      <button type="button" class="color-row boxed" onClick={() => setOpen(!open)}>
        <Swatch color={value} />
        <span class="mono truncate grow">{colorKey(value) ?? value}</span>
      </button>
      {open && (
        <ColorPopover
          value={value}
          onChange={onChange}
          onClose={() => setOpen(false)}
          onReset={onReset ? () => (onReset(), setOpen(false)) : undefined}
        />
      )}
    </div>
  );
}
