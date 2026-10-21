import { t } from "../../i18n";
import type { JSX } from "preact";
import { computedValue, type StyleBinding } from "../../state/binding";
import { BoxSpacing } from "../controls/BoxSpacing";
import { ColorField } from "../controls/ColorField";
import { NumberField } from "../controls/NumberField";

/** Couleurs, bordures et espacements d'un élément sélectionné. */
export function BoxControls({ binding }: { binding: StyleBinding }): JSX.Element {
  const display = computedValue(binding.sample, "display");
  const isLayout = /flex|grid/.test(display);
  const hasBorder = parseFloat(binding.get("border-top-width")) > 0 || binding.isChanged("border-width");

  const color = (label: string, property: string): JSX.Element => (
    <ColorField
      label={label}
      value={binding.get(property)}
      changed={binding.isChanged(property)}
      onChange={(value) => binding.set(property, value)}
      onReset={binding.isChanged(property) ? () => binding.reset(property) : undefined}
    />
  );

  return (
    <>
      <section class="section stack">
        <span class="section-title">{t("box.colors")}</span>
        <div class="grid-2">
          {color(t("box.text"), "color")}
          {color(t("box.background"), "background-color")}
        </div>
      </section>
      <section class="section stack">
        <span class="section-title">{t("box.shape")}</span>
        <div class="grid-2">
          <NumberField label={t("box.radius")} property="border-radius" value={binding.get("border-top-left-radius")} units={["px", "rem", "%"]} min={0}
            changed={binding.isChanged("border-radius")} onChange={(value) => binding.set("border-radius", value)} />
          <NumberField label={t("box.border")} property="border-width" value={binding.get("border-top-width")} units={["px"]} min={0}
            changed={binding.isChanged("border-width")} onChange={(value) => {
              binding.set("border-width", value);
              if (!binding.isChanged("border-style") && binding.get("border-top-style") === "none") binding.set("border-style", "solid");
            }} />
          {hasBorder && color(t("box.borderColor"), "border-color")}
          <NumberField label={t("box.opacity")} property="opacity" value={binding.get("opacity")} units={[""]} step={0.05} min={0} max={1}
            changed={binding.isChanged("opacity")} onChange={(value) => binding.set("opacity", value)} />
        </div>
      </section>
      <section class="section stack">
        <span class="section-title">{t("box.spacing")}</span>
        <BoxSpacing binding={binding} kind="padding" title={t("box.padding")} />
        <BoxSpacing binding={binding} kind="margin" title={t("box.margin")} />
        {isLayout && (
          <NumberField label={t("box.gap")} property="gap" value={binding.get("row-gap")} units={["px", "rem", "em"]} min={0}
            changed={binding.isChanged("gap")} onChange={(value) => binding.set("gap", value)} />
        )}
      </section>
    </>
  );
}
