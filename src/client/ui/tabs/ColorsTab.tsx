import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { changeKey } from "../../../shared/css";
import { sheetScan } from "../../engine/overrides";
import { changes, removeChange } from "../../state/changes";
import { currentSwap, refreshVisibleColors, setSwap, setVariable, siteColors, variableChange } from "../../state/palettes";
import { friendlyTokenName, matchesToken, usageLabel } from "../../engine/token-names";
import { ColorTargetRow } from "../colors/ColorTargetRow";
import { PalettesSection } from "../colors/PalettesSection";

const INITIAL_ROWS = 12;

function VariablesSection(): JSX.Element | null {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const variables = sheetScan.value.variables;
  if (variables.length === 0) return null;
  const filtered = variables.filter((variable) => matchesToken(variable.name, query));
  const shown = showAll || query ? filtered : filtered.slice(0, INITIAL_ROWS);
  return (
    <section class="section">
      <div class="section-head">
        <span class="section-title">Variables du site</span>
        <span class="muted">{variables.length}</span>
      </div>
      <p class="hint">Changer une variable change partout où elle est utilisée.</p>
      {variables.length > INITIAL_ROWS && (
        <input class="input" placeholder="Chercher une couleur (ex. fond, accent)" value={query} onInput={(e) => setQuery(e.currentTarget.value)} style="margin-bottom:6px" />
      )}
      {shown.map((variable) => {
        const key = changeKey(variableChange(variable, ""));
        const existing = changes.value.find((change) => changeKey(change) === key);
        return (
          <ColorTargetRow
            key={variable.name}
            label={friendlyTokenName(variable.name)}
            sublabel={`${variable.name} · ${usageLabel(variable.uses)}`}
            original={variable.value}
            current={existing?.value ?? null}
            onApply={(value) => setVariable(variable, value)}
            onReset={() => removeChange(key)}
          />
        );
      })}
      {!showAll && !query && filtered.length > INITIAL_ROWS && (
        <button type="button" class="btn btn-ghost btn-block" onClick={() => setShowAll(true)}>
          Voir les {filtered.length} variables
        </button>
      )}
    </section>
  );
}

function SiteColorsSection(): JSX.Element {
  const [showAll, setShowAll] = useState(false);
  const all = siteColors.value;
  const visible = all.filter((color) => color.visible > 0);
  const list = showAll ? all : visible;
  return (
    <section class="section">
      <div class="section-head">
        <span class="section-title">Couleurs de la page</span>
        <span class="muted">{visible.length}</span>
      </div>
      <p class="hint">Remplace une couleur partout, survols et variables compris.</p>
      {list.length === 0 && <p class="hint">Aucune couleur détectée dans les feuilles de style.</p>}
      {list.map((color) => {
        const swap = currentSwap(color.key);
        return (
          <ColorTargetRow
            key={color.key}
            label={color.key}
            sublabel={color.visible > 0 ? `${color.visible} élément${color.visible > 1 ? "s" : ""} dans la page` : "pas visible sur cette page"}
            showValue={false}
            original={color.key}
            current={swap?.value ?? null}
            onApply={(value) => setSwap(color.key, value)}
            onReset={() => swap && removeChange(changeKey(swap))}
          />
        );
      })}
      {!showAll && all.length > visible.length && (
        <button type="button" class="btn btn-ghost btn-block" onClick={() => setShowAll(true)}>
          Afficher aussi les {all.length - visible.length} couleurs non visibles
        </button>
      )}
    </section>
  );
}

export function ColorsTab(): JSX.Element {
  useEffect(refreshVisibleColors, [sheetScan.value]);
  return (
    <>
      <PalettesSection />
      <VariablesSection />
      <SiteColorsSection />
    </>
  );
}
