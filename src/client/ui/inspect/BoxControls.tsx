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
        <span class="section-title">Couleurs</span>
        <div class="grid-2">
          {color("Texte", "color")}
          {color("Fond", "background-color")}
        </div>
      </section>
      <section class="section stack">
        <span class="section-title">Forme</span>
        <div class="grid-2">
          <NumberField label="Arrondi" property="border-radius" value={binding.get("border-top-left-radius")} units={["px", "rem", "%"]} min={0}
            changed={binding.isChanged("border-radius")} onChange={(value) => binding.set("border-radius", value)} />
          <NumberField label="Bordure" property="border-width" value={binding.get("border-top-width")} units={["px"]} min={0}
            changed={binding.isChanged("border-width")} onChange={(value) => {
              binding.set("border-width", value);
              if (!binding.isChanged("border-style") && binding.get("border-top-style") === "none") binding.set("border-style", "solid");
            }} />
          {hasBorder && color("Couleur de bordure", "border-color")}
          <NumberField label="Opacité" property="opacity" value={binding.get("opacity")} units={[""]} step={0.05} min={0} max={1}
            changed={binding.isChanged("opacity")} onChange={(value) => binding.set("opacity", value)} />
        </div>
      </section>
      <section class="section stack">
        <span class="section-title">Espacements</span>
        <BoxSpacing binding={binding} kind="padding" title="Marge intérieure" />
        <BoxSpacing binding={binding} kind="margin" title="Marge extérieure" />
        {isLayout && (
          <NumberField label="Écart entre les enfants" property="gap" value={binding.get("row-gap")} units={["px", "rem", "em"]} min={0}
            changed={binding.isChanged("gap")} onChange={(value) => binding.set("gap", value)} />
        )}
      </section>
    </>
  );
}
