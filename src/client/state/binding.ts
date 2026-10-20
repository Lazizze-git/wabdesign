import type { ChangeGroup, FontRef, Target } from "../../shared/types";
import { changeKey } from "../../shared/css";
import { changes, findChange, removeChange, upsertChange } from "./changes";
import { pageVersion } from "../engine/page-watch";
import { uid } from "./toasts";

/**
 * Lien entre un groupe de contrôles et une cible : lit la valeur actuelle
 * (retouche en cours, sinon valeur réelle de la page) et enregistre les modifications.
 */
export interface StyleBinding {
  target: Target;
  sample: Element | null;
  get(property: string): string;
  original(property: string): string;
  isChanged(property: string): boolean;
  set(property: string, value: string, font?: FontRef | null): void;
  reset(property: string): void;
}

export function computedValue(element: Element | null, property: string): string {
  if (!element?.isConnected) return "";
  return getComputedStyle(element).getPropertyValue(property).trim();
}

export function createBinding(group: ChangeGroup, target: Target, sample: Element | null): StyleBinding {
  // Lire ces signaux ici abonne le composant appelant : il se met à jour quand les retouches
  // changent, et quand la page change (valeurs relues sur les vrais éléments).
  const snapshot = changes.value;
  void pageVersion.value;
  const current = (property: string): string | undefined =>
    snapshot.find((c) => c.group === group && c.target.selector === target.selector && c.property === property)?.value;

  const original = (property: string): string => {
    const existing = findChange(group, target.selector, property);
    return existing?.previous ?? computedValue(sample, property);
  };

  return {
    target,
    sample,
    get: (property) => current(property) ?? computedValue(sample, property),
    original,
    isChanged: (property) => current(property) !== undefined,
    set(property, value, font = null) {
      upsertChange({
        id: uid("chg"),
        group,
        target,
        property,
        value,
        previous: original(property) || null,
        font,
      });
    },
    reset(property) {
      const existing = findChange(group, target.selector, property);
      if (existing) removeChange(changeKey(existing));
    },
  };
}
