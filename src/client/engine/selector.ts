import { t, type MessageKey } from "../i18n";
import type { ElementContext } from "../../shared/types";

/** Les identifiants générés (React `:r1:`, `radix-…`) changent d'un rendu à l'autre : on les évite. */
function hasStableId(element: Element): boolean {
  const id = element.id;
  if (!id || /[:]|^radix-|^headlessui-|\d{4,}/.test(id)) return false;
  return element.ownerDocument.querySelectorAll(`#${CSS.escape(id)}`).length === 1;
}

function segment(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const parent = element.parentElement;
  if (!parent) return tag;
  const sameTag = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
  if (sameTag.length === 1) return tag;
  return `${tag}:nth-of-type(${sameTag.indexOf(element) + 1})`;
}

/** Sélecteur qui ne vise que cet élément-là. */
export function uniqueSelector(element: Element): string {
  if (hasStableId(element)) return `#${CSS.escape(element.id)}`;
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== element.ownerDocument.documentElement) {
    if (current !== element && hasStableId(current)) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }
    parts.unshift(segment(current));
    if (current.tagName === "BODY") break;
    current = current.parentElement;
  }
  return parts.join(" > ");
}

export function classesOf(element: Element): string[] {
  return Array.from(element.classList).filter((name) => !name.startsWith("__od"));
}

/** Sélecteur des éléments « de la même famille » : même balise, mêmes classes. */
export function similarSelector(element: Element): string | null {
  const classes = classesOf(element);
  if (classes.length === 0) return null;
  return `${element.tagName.toLowerCase()}${classes.map((name) => `.${CSS.escape(name)}`).join("")}`;
}

export function countMatches(selector: string): number {
  try {
    return document.querySelectorAll(selector).length;
  } catch {
    return 0;
  }
}

function shortText(element: Element): string {
  const text = (element instanceof HTMLElement ? element.innerText : element.textContent) ?? "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}

export function describeElement(element: Element, selector: string): ElementContext {
  return {
    tag: element.tagName.toLowerCase(),
    classes: classesOf(element).slice(0, 30),
    text: shortText(element),
    count: countMatches(selector),
  };
}

const TAG_NAMES: Record<string, MessageKey> = {
  a: "el.a",
  button: "el.button",
  p: "el.p",
  img: "el.img",
  input: "el.input",
  textarea: "el.input",
  select: "el.select",
  li: "el.li",
  ul: "el.ul",
  nav: "el.nav",
  header: "el.header",
  footer: "el.footer",
  section: "el.section",
  span: "el.span",
  label: "el.label",
  main: "el.main",
  div: "el.div",
  article: "el.article",
  aside: "el.aside",
  form: "el.form",
  figure: "el.figure",
  ol: "el.ul",
};

/** Nom court d'un élément, sans son texte : « Bouton », « Titre h2 », « Bloc <div> ». */
export function elementName(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const name = TAG_NAMES[tag];
  return /^h[1-6]$/.test(tag) ? t("el.heading", { tag }) : name ? t(name) : t("el.block", { tag });
}

/** Nom au pluriel pour « tous les … de la page » ; null si on n'a pas de mot simple. */
export function elementPlural(element: Element): string | null {
  const tag = element.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return t("el.many.heading", { tag });
  const key = PLURALS[tag];
  return key ? t(key) : null;
}

const PLURALS: Record<string, MessageKey> = {
  a: "el.many.a",
  button: "el.many.button",
  p: "el.many.p",
  img: "el.many.img",
  input: "el.many.input",
  li: "el.many.li",
  section: "el.many.section",
  span: "el.many.span",
  label: "el.many.label",
};

/** Nom lisible d'un élément : « Bouton « Réserver » », « Titre h2 « Nos vins » »… */
export function humanLabel(element: Element): string {
  const base = elementName(element);
  const text = shortText(element);
  if (!text || text.length > 40) return base;
  return t("el.quoted", { base, text });
}
