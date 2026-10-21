/**
 * D’où vient une feuille de style : du site lui-même, ou d’ailleurs (extension du navigateur,
 * bibliothèque, CDN) ? Les styles étrangers ne doivent pas se faire passer pour le design system.
 */

/** Marqueurs posés par les outils de développement sur les styles du projet qu’ils injectent. */
const PROJECT_MARKERS = [
  "data-vite-dev-id",
  "data-n-href",
  "data-precedence",
  "data-href",
  "data-styled",
  "data-emotion",
  "data-astro-cid",
  "data-svelte-h",
] as const;

const LIBRARY_PATH = /\/node_modules\/|\/vendor\/|\.min\.css(\?|$)/i;

/** Feuilles présentes dans le HTML d’origine (relevées au démarrage du panneau). */
let initialNodes = new WeakSet<Node>();

export function rememberInitialStyles(doc: Document = document): void {
  initialNodes = new WeakSet(Array.from(doc.querySelectorAll('style, link[rel~="stylesheet"]')));
}

function hasProjectMarker(element: Element): boolean {
  return PROJECT_MARKERS.some((name) => element.hasAttribute(name));
}

/** Vrai si la feuille vient d’ailleurs que du site (bibliothèque, CDN, extension). */
export function isExternalSheet(sheet: CSSStyleSheet, doc: Document = document): boolean {
  if (sheet.href) {
    try {
      const url = new URL(sheet.href, doc.baseURI);
      return url.origin !== doc.location.origin || LIBRARY_PATH.test(url.pathname);
    } catch {
      return true;
    }
  }
  const owner = sheet.ownerNode;
  if (!(owner instanceof Element)) return false;
  if (hasProjectMarker(owner) || initialNodes.has(owner)) return false;
  // Une balise <style> ajoutée après coup, sans marqueur d’outil de développement :
  // typiquement une extension du navigateur ou une bibliothèque JavaScript.
  return true;
}

/** Préfixes de variables de bibliothèques courantes (calendriers, carrousels, cartes, kits d’interface). */
const LIBRARY_PREFIXES = [
  "litepicker", "flatpickr", "rdp", "swiper", "splide", "glide", "tippy", "toastify", "plyr",
  "leaflet", "mapbox", "maplibre", "pswp", "fancybox", "bs", "mdc", "chakra", "mantine",
] as const;

/** Vrai si le nom de variable appartient visiblement à une bibliothèque (--swiper-…, --bs-…). */
export function isLibraryToken(name: string): boolean {
  const bare = name.replace(/^--/, "").toLowerCase();
  return LIBRARY_PREFIXES.some((prefix) => bare.startsWith(`${prefix}-`));
}
