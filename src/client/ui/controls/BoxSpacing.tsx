import { t } from "../../i18n";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import type { StyleBinding } from "../../state/binding";
import { Icon } from "../icons";
import { NumberField } from "./NumberField";

const SIDES = [
  { side: "top", label: "box.top" },
  { side: "right", label: "box.right" },
  { side: "bottom", label: "box.bottom" },
  { side: "left", label: "box.left" },
] as const;

interface BoxSpacingProps {
  binding: StyleBinding;
  kind: "padding" | "margin";
  title: string;
}

/** Marges intérieures ou extérieures : une valeur pour les 4 côtés, ou côté par côté. */
export function BoxSpacing({ binding, kind, title }: BoxSpacingProps): JSX.Element {
  const values = SIDES.map(({ side }) => binding.get(`${kind}-${side}`));
  const allEqual = values.every((value) => value === values[0]);
  const [linked, setLinked] = useState(allEqual);
  const changed = SIDES.some(({ side }) => binding.isChanged(`${kind}-${side}`));
  const min = kind === "padding" ? 0 : undefined;

  const setAll = (value: string): void => {
    for (const { side } of SIDES) binding.set(`${kind}-${side}`, value);
  };

  return (
    <div class="field">
      <div class="row">
        <span class="label grow">
          {title}
          {changed && <span class="changed"> •</span>}
        </span>
        <button
          type="button"
          class="icon-btn sm"
          aria-pressed={linked}
          onClick={() => setLinked(!linked)}
          title={linked ? t("box.unlink") : t("box.link")}
          aria-label={linked ? t("box.unlink") : t("box.link")}
        >
          <Icon name="link" size={13} />
        </button>
      </div>
      {linked ? (
        <NumberField label={t("box.allSides")} property={`${kind}-top`} value={values[0] ?? "0px"} units={["px", "rem", "em", "%"]} min={min} onChange={setAll} />
      ) : (
        <div class="grid-2">
          {SIDES.map(({ side, label }, index) => (
            <NumberField
              key={side}
              label={t(label)}
              property={`${kind}-${side}`}
              value={values[index] ?? "0px"}
              units={["px", "rem", "em", "%"]}
              min={min}
              changed={binding.isChanged(`${kind}-${side}`)}
              onChange={(value) => binding.set(`${kind}-${side}`, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
