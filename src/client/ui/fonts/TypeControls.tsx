import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { fontFamilyValue } from "../../../shared/css";
import type { FontFamily } from "../../../shared/types";
import { loadFamily } from "../../engine/font-loader";
import { familyFromCss, firstFamilyName, nearestWeight } from "../../engine/font-sync";
import type { StyleBinding } from "../../state/binding";
import { NumberField } from "../controls/NumberField";
import { Segmented } from "../controls/Segmented";
import { AxesControl } from "./AxesControl";
import { FontSheet } from "./FontSheet";
import { WeightControl } from "./WeightControl";

interface TypeControlsProps {
  binding: StyleBinding;
  title: string;
  showSize?: boolean;
}

const CASES = [
  { value: "none", label: "Aa" },
  { value: "uppercase", label: "AA" },
  { value: "lowercase", label: "aa" },
  { value: "capitalize", label: "Aa Bb" },
] as const;
type CaseValue = (typeof CASES)[number]["value"];

/** Réglages typographiques complets d'une cible : police, graisse, axes, taille, interligne… */
export function TypeControls({ binding, title, showSize = false }: TypeControlsProps): JSX.Element {
  const [picking, setPicking] = useState(false);
  const familyCss = binding.get("font-family");
  const family = familyFromCss(familyCss);
  const weight = Number(binding.get("font-weight")) || 400;
  const italic = binding.get("font-style") === "italic";
  const textCase = binding.get("text-transform") as CaseValue;

  const pick = (picked: FontFamily): void => {
    loadFamily(picked);
    binding.set("font-family", fontFamilyValue(picked.family, picked.category), { source: picked.source, family: picked.family });
    const best = nearestWeight(picked, weight, italic);
    if (best !== weight) binding.set("font-weight", String(best));
    if (italic && !picked.faces.some((face) => face.style === "italic")) binding.set("font-style", "normal");
  };

  const setItalic = (next: boolean): void => {
    binding.set("font-style", next ? "italic" : "normal");
    if (family) {
      const best = nearestWeight(family, weight, next);
      if (best !== weight) binding.set("font-weight", String(best));
    }
  };

  return (
    <div class="stack">
      <div class="field">
        <span class="label">
          Police{binding.isChanged("font-family") && <span class="changed"> •</span>}
        </span>
        <button type="button" class="picker-btn" onClick={() => setPicking(true)}>
          <span class="font-name" style={{ fontFamily: familyCss, fontSize: "15px" }}>
            {family?.family ?? (firstFamilyName(familyCss) || "Police du site")}
          </span>
          {!family && <span class="tag">du site</span>}
        </button>
      </div>
      <WeightControl
        family={family}
        weight={weight}
        italic={italic}
        changed={binding.isChanged("font-weight") || binding.isChanged("font-style")}
        onWeight={(next) => binding.set("font-weight", String(next))}
        onItalic={setItalic}
      />
      {family && (
        <AxesControl
          axes={family.faces[0]?.axes ?? []}
          value={binding.get("font-variation-settings")}
          onChange={(value) => binding.set("font-variation-settings", value)}
        />
      )}
      <div class="grid-2">
        {showSize && (
          <NumberField label="Taille" property="font-size" value={binding.get("font-size")} units={["px", "rem", "em"]} min={1}
            changed={binding.isChanged("font-size")} onChange={(value) => binding.set("font-size", value)} />
        )}
        <NumberField label="Interligne" property="line-height" value={lineHeightValue(binding)} units={["", "px", "em"]} step={0.05} min={0}
          changed={binding.isChanged("line-height")} onChange={(value) => binding.set("line-height", value)} />
        <NumberField label="Interlettrage" property="letter-spacing" value={letterSpacingValue(binding)} units={["em", "px"]} step={0.005}
          changed={binding.isChanged("letter-spacing")} onChange={(value) => binding.set("letter-spacing", value)} />
      </div>
      <Segmented label="Casse" options={CASES} value={CASES.some((c) => c.value === textCase) ? textCase : "none"}
        onChange={(value) => binding.set("text-transform", value)} />
      {picking && <FontSheet title={title} value={family ?? null} onPick={pick} onClose={() => setPicking(false)} />}
    </div>
  );
}

/** Interligne affiché sans unité (×), plus parlant que des pixels calculés. */
function lineHeightValue(binding: StyleBinding): string {
  const value = binding.get("line-height");
  if (binding.isChanged("line-height") || !value.endsWith("px")) return value === "normal" ? "1.2" : value;
  const size = parseFloat(binding.get("font-size")) || 16;
  return String(Math.round((parseFloat(value) / size) * 100) / 100);
}

/** Interlettrage affiché en em, l'unité qui suit la taille du texte. */
function letterSpacingValue(binding: StyleBinding): string {
  const value = binding.get("letter-spacing");
  if (binding.isChanged("letter-spacing") || !value.endsWith("px")) return value === "normal" ? "0em" : value;
  const size = parseFloat(binding.get("font-size")) || 16;
  return `${Math.round((parseFloat(value) / size) * 1000) / 1000}em`;
}
