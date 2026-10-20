import type { JSX } from "preact";
import { useState } from "preact/hooks";
import type { FontRole } from "../../../shared/types";
import { ROLE_ORDER, ROLES, roleTarget, sampleElement } from "../../engine/roles";
import { createBinding } from "../../state/binding";
import { removeWhere } from "../../state/changes";
import { config } from "../../state/library";
import { applyPairing, deletePairing, saveCurrentPairing, shufflePairing } from "../../state/pairings";
import { getHost } from "../../state/ui";
import { TypeControls } from "../fonts/TypeControls";
import { Icon } from "../icons";

function RoleSection({ role }: { role: FontRole }): JSX.Element {
  const [open, setOpen] = useState(role !== "buttons");
  const definition = ROLES[role];
  const target = roleTarget(role);
  const binding = createBinding("fonts", target, sampleElement(definition.sample, getHost()));
  const reset = (): void => removeWhere((change) => change.group === "fonts" && change.target.selector === target.selector);

  return (
    <section class="section">
      <div class="section-head">
        <button type="button" class="icon-btn sm" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={open ? "Replier" : "Déplier"}>
          <Icon name={open ? "minimize" : "plus"} size={14} />
        </button>
        <span class="section-title">{definition.label}</span>
        <button type="button" class="btn btn-ghost" onClick={reset} title="Revenir aux polices du site">
          Rétablir
        </button>
      </div>
      {open && <TypeControls binding={binding} title={definition.label} />}
    </section>
  );
}

function PairingsSection(): JSX.Element {
  const pairings = config.value?.pairings ?? [];
  return (
    <section class="section">
      <div class="section-head">
        <span class="section-title">Combinaisons</span>
        <button type="button" class="btn" onClick={shufflePairing} title="Tirer au sort parmi tes favoris">
          <Icon name="shuffle" size={14} /> Mélanger
        </button>
        <button type="button" class="btn" onClick={saveCurrentPairing} title="Enregistrer la combinaison actuelle" aria-label="Enregistrer la combinaison actuelle">
          <Icon name="plus" size={14} />
        </button>
      </div>
      {pairings.length === 0 ? (
        <p class="hint">Choisis tes polices, puis enregistre la combinaison pour la retrouver dans tous tes projets.</p>
      ) : (
        <div class="stack">
          {pairings.map((pairing) => (
            <div class="row" key={pairing.id}>
              <button type="button" class="btn grow" style="justify-content:flex-start" onClick={() => applyPairing(pairing)}>
                <span class="truncate">{pairing.name}</span>
              </button>
              <button type="button" class="icon-btn" onClick={() => deletePairing(pairing.id)} aria-label={`Supprimer ${pairing.name}`}>
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function FontsTab(): JSX.Element {
  return (
    <>
      <PairingsSection />
      {ROLE_ORDER.map((role) => (
        <RoleSection key={role} role={role} />
      ))}
    </>
  );
}
