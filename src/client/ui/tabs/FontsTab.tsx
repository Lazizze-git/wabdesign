import { t } from "../../i18n";
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
        <button type="button" class="icon-btn sm" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={open ? t("fonts.collapse") : t("fonts.expand")}>
          <Icon name={open ? "minimize" : "plus"} size={14} />
        </button>
        <span class="section-title">{t(definition.label)}</span>
        <button type="button" class="btn btn-ghost" onClick={reset} title={t("fonts.resetRole")}>
          {t("common.reset")}
        </button>
      </div>
      {open && <TypeControls binding={binding} title={t(definition.label)} />}
    </section>
  );
}

function PairingsSection(): JSX.Element {
  const pairings = config.value?.pairings ?? [];
  return (
    <section class="section">
      <div class="section-head">
        <span class="section-title">{t("fonts.pairings")}</span>
        <button type="button" class="btn" onClick={shufflePairing} title={t("fonts.shuffleHint")}>
          <Icon name="shuffle" size={14} /> {t("fonts.shuffle")}
        </button>
        <button type="button" class="btn" onClick={saveCurrentPairing} title={t("fonts.savePairing")} aria-label={t("fonts.savePairing")}>
          <Icon name="plus" size={14} />
        </button>
      </div>
      {pairings.length === 0 ? (
        <p class="hint">{t("fonts.pairingsEmpty")}</p>
      ) : (
        <div class="stack">
          {pairings.map((pairing) => (
            <div class="row" key={pairing.id}>
              <button type="button" class="btn grow" style="justify-content:flex-start" onClick={() => applyPairing(pairing)}>
                <span class="truncate">{pairing.name}</span>
              </button>
              <button type="button" class="icon-btn" onClick={() => deletePairing(pairing.id)} aria-label={t("fonts.deletePairing", { name: pairing.name })}>
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
