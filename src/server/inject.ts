import { LAYER_DECLARATION } from "../shared/css";

export const PANEL_PATH = "/__design/panel.js";

/**
 * La déclaration des couches CSS doit arriver avant toute feuille du site :
 * c'est ce qui garantit que les retouches passent devant les styles existants.
 */
export const INJECTION = `<style id="__od-layers">${LAYER_DECLARATION}</style><script src="${PANEL_PATH}" defer></script>`;

/** Glisse le panneau au tout début du <head> d'une page HTML. */
export function injectPanel(html: string): string {
  if (html.includes('id="__od-layers"')) return html;
  for (const pattern of [/<head(\s[^>]*)?>/i, /<html(\s[^>]*)?>/i]) {
    const match = pattern.exec(html);
    if (match) {
      const end = match.index + match[0].length;
      return `${html.slice(0, end)}${INJECTION}${html.slice(end)}`;
    }
  }
  return `${INJECTION}${html}`;
}
