import type { Change } from "../../shared/types";
import { t, type MessageKey } from "../i18n";
import { friendlyTokenName } from "./token-names";

/** Propriété CSS → libellé du panneau (les mêmes mots que dans les réglages). */
const PROPERTIES: Record<string, MessageKey> = {
  "font-family": "type.font",
  "font-weight": "type.weight",
  "font-style": "type.italic",
  "font-size": "type.size",
  "line-height": "type.lineHeight",
  "letter-spacing": "type.letterSpacing",
  "text-transform": "type.case",
  "font-variation-settings": "prop.axes",
  color: "prop.textColor",
  "background-color": "box.background",
  "border-radius": "box.radius",
  "border-width": "box.border",
  "border-style": "prop.borderStyle",
  "border-color": "box.borderColor",
  opacity: "box.opacity",
  gap: "box.gap",
  "padding-block": "set.buttonPy",
  "padding-inline": "set.buttonPx",
  "max-width": "set.measure",
};

const SIDES: Record<string, MessageKey> = {
  top: "box.top",
  right: "box.right",
  bottom: "box.bottom",
  left: "box.left",
};

function sideLabel(property: string): string | null {
  const match = /^(padding|margin)-(top|right|bottom|left)$/.exec(property);
  if (!match?.[1] || !match[2]) return null;
  const box = t(match[1] === "padding" ? "box.padding" : "box.margin");
  const side = SIDES[match[2]];
  return side ? `${box} · ${t(side).toLowerCase()}` : box;
}

/** Ce qu’une modification règle, en mots simples : « Arrondi », « Marge extérieure · haut », « Encre »… */
export function propertyLabel(change: Change): string {
  if (change.group === "text") return t("prop.content");
  if (change.group === "vars") return friendlyTokenName(change.property);
  const key = PROPERTIES[change.property];
  return key ? t(key) : (sideLabel(change.property) ?? change.property);
}
