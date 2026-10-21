import { t, type MessageKey } from "../i18n";
import type { FontRole, Target } from "../../shared/types";

/** Les grands rôles typographiques d'un site, et les éléments qu'ils couvrent. */
export const ROLES: Record<FontRole, { label: MessageKey; selector: string; sample: string }> = {
  headings: {
    label: "role.headings",
    selector: "h1, h2, h3, h4, h5, h6",
    sample: "h1, h2, h3",
  },
  body: {
    label: "role.body",
    selector: "body, p, li, blockquote, figcaption, label, td, th, dd, dt, input, textarea, select",
    sample: "p, li, body",
  },
  buttons: {
    label: "role.buttons",
    selector: 'button, [role="button"], input[type="submit"], input[type="button"]',
    sample: 'button, [role="button"]',
  },
};

export const ROLE_ORDER: readonly FontRole[] = ["headings", "body", "buttons"];

export function roleTarget(role: FontRole): Target {
  const definition = ROLES[role];
  return { selector: definition.selector, label: t(definition.label), scope: "role", context: null };
}

/** Premier élément visible qui représente le rôle (pour lire ses valeurs actuelles). */
export function sampleElement(selectorList: string, host: Element | null): Element | null {
  for (const selector of selectorList.split(",")) {
    let candidates: Element[];
    try {
      candidates = Array.from(document.querySelectorAll(selector.trim()));
    } catch {
      continue;
    }
    const visible = candidates.find((element) => {
      if (host?.contains(element)) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    if (visible) return visible;
  }
  return null;
}
