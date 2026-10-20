import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { fontFamilyValue } from "../../../shared/css";
import type { FontFamily } from "../../../shared/types";
import { parseLength } from "../../engine/css-value";
import { loadFamily } from "../../engine/font-loader";
import { familyFromCss, firstFamilyName } from "../../engine/font-sync";
import { stepFor, unitsFor } from "../../engine/token-kinds";
import { resetToken, resolvedValue, setToken, tokenChange, type ClassifiedToken } from "../../state/tokens";
import { friendlyTokenName, usageLabel } from "../../engine/token-names";
import { ColorTargetRow } from "../colors/ColorTargetRow";
import { NumberField } from "../controls/NumberField";
import { TextField } from "../controls/TextField";
import { FontSheet } from "../fonts/FontSheet";
import { Icon } from "../icons";

function FontTokenRow({ token, value }: { token: ClassifiedToken; value: string }): JSX.Element {
  const [picking, setPicking] = useState(false);
  const family = familyFromCss(value);
  const pick = (picked: FontFamily): void => {
    loadFamily(picked);
    setToken(token, fontFamilyValue(picked.family, picked.category), { source: picked.source, family: picked.family });
  };
  return (
    <div class="field">
      <span class="label label-row">
        <span class="truncate">
          {friendlyTokenName(token.name)}
          {tokenChange(token) && <span class="changed"> •</span>}
        </span>
        <span class="label-code">{token.name}</span>
      </span>
      <button type="button" class="picker-btn" onClick={() => setPicking(true)}>
        <span class="font-name" style={{ fontFamily: value, fontSize: "15px" }}>
          {family?.family ?? (firstFamilyName(value) || value)}
        </span>
      </button>
      {picking && <FontSheet title={friendlyTokenName(token.name)} value={family ?? null} onPick={pick} onClose={() => setPicking(false)} />}
    </div>
  );
}

/** Le bon réglage pour chaque variable, selon sa famille. */
export function TokenRow({ token }: { token: ClassifiedToken }): JSX.Element {
  const change = tokenChange(token);
  const original = resolvedValue(token);
  const value = change?.value ?? original;
  const changed = change !== undefined;

  if (token.kind === "color") {
    return (
      <ColorTargetRow
        label={friendlyTokenName(token.name)}
        sublabel={`${token.name} · ${usageLabel(token.uses)}`}
        original={original}
        current={change?.value ?? null}
        onApply={(next) => setToken(token, next)}
        onReset={() => resetToken(token)}
      />
    );
  }
  if (token.kind === "font") return <FontTokenRow token={token} value={value} />;

  // Variable calculée à partir d'autres (ex. --radius-lg: calc(var(--radius) * 2)) : on montre sa formule.
  const sources = [...token.value.matchAll(/var\(\s*(--[\w-]+)/g)].flatMap((match) => (match[1] ? [match[1]] : []));
  if (sources.length > 0) {
    return (
      <div class="stack" style="gap:2px">
        <TextField label={friendlyTokenName(token.name)} code={token.name} value={change?.value ?? token.value} changed={changed} onChange={(next) => setToken(token, next)} />
        <span class="hint" style="margin:0">
          Calculée à partir de {sources.join(", ")} = {original}
        </span>
      </div>
    );
  }

  const control = parseLength(value) ? (
    <NumberField
      label={friendlyTokenName(token.name)}
      code={token.name}
      property={token.name}
      value={value}
      units={unitsFor(value)}
      step={stepFor(value, token.kind)}
      min={token.kind === "tracking" ? undefined : 0}
      changed={changed}
      onChange={(next) => setToken(token, next)}
    />
  ) : (
    <TextField label={friendlyTokenName(token.name)} code={token.name} value={value} changed={changed} onChange={(next) => setToken(token, next)} />
  );

  return (
    <div class="row" style="align-items:flex-end">
      <div class="grow" style="min-width:0">
        {control}
      </div>
      {changed && (
        <button type="button" class="icon-btn" onClick={() => resetToken(token)} title={`Rétablir ${original}`} aria-label="Rétablir">
          <Icon name="undo" size={14} />
        </button>
      )}
    </div>
  );
}
