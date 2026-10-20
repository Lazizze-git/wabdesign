import { effect } from "@preact/signals";
import type { Change } from "../../shared/types";
import { changes, showOriginal } from "../state/changes";
import { getHost } from "../state/ui";

const NOT_TEXT = new Set(["IMG", "INPUT", "TEXTAREA", "SELECT", "SVG", "VIDEO", "AUDIO", "CANVAS", "BR", "HR", "IFRAME"]);

/** Sélecteur → élément réécrit et son texte d'origine. */
const applied = new Map<string, { element: Element; original: string }>();
/** Élément en cours d'édition directe dans la page : on ne le réécrit pas pendant la frappe. */
let editing: Element | null = null;

export function readText(element: Element): string {
  return element.textContent ?? "";
}

/** Seuls les éléments qui ne contiennent que du texte se réécrivent sans risque. */
export function isTextEditable(element: Element): boolean {
  if (NOT_TEXT.has(element.tagName.toUpperCase()) || getHost()?.contains(element)) return false;
  return element.children.length === 0;
}

/**
 * On modifie les nœuds texte existants au lieu de les remplacer :
 * React garde ses références et ne plante pas au rendu suivant.
 */
export function writeText(element: Element, text: string): void {
  const nodes = Array.from(element.childNodes).filter((node): node is Text => node.nodeType === Node.TEXT_NODE);
  const [first, ...rest] = nodes;
  if (!first) {
    element.append(document.createTextNode(text));
    return;
  }
  if (first.nodeValue !== text) first.nodeValue = text;
  for (const node of rest) if (node.nodeValue) node.nodeValue = "";
}

function query(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

/**
 * L'élément visé, seulement si c'est bien lui : celui qu'on a déjà réécrit, ou un élément
 * qui porte encore le texte d'origine. Évite de réécrire le titre d'une autre page.
 */
function targetOf(change: Change): Element | null {
  const element = query(change.target.selector);
  if (!element || !isTextEditable(element)) return null;
  if (applied.get(change.target.selector)?.element === element) return element;
  const current = readText(element);
  return current === change.previous || current === change.value ? element : null;
}

function apply(): void {
  const active = showOriginal.value ? [] : changes.value.filter((change) => change.group === "text");
  const selectors = new Set(active.map((change) => change.target.selector));
  for (const change of active) {
    const element = targetOf(change);
    if (!element || element === editing) continue;
    if (readText(element) !== change.value) writeText(element, change.value);
    applied.set(change.target.selector, { element, original: change.previous ?? "" });
  }
  for (const [selector, { element, original }] of applied) {
    if (selectors.has(selector)) continue;
    if (element.isConnected && element !== editing) writeText(element, original);
    applied.delete(selector);
  }
}

/** Applique les textes réécrits et les remet si le site se ré-affiche (navigation, rechargement à chaud). */
export function startTextOverrides(): void {
  effect(apply);
  let frame = 0;
  const observer = new MutationObserver(() => {
    if (frame || (applied.size === 0 && !changes.value.some((change) => change.group === "text"))) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      apply();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

/** Rend le texte d'un élément modifiable directement dans la page (Entrée ou Échap pour finir). */
export function editInPage(element: HTMLElement, onText: (text: string) => void, onEnd: () => void): void {
  editing = element;
  element.setAttribute("contenteditable", "plaintext-only");
  element.focus();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  window.getSelection()?.removeAllRanges();
  window.getSelection()?.addRange(range);

  const onInput = (): void => onText(readText(element));
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) {
      event.preventDefault();
      element.blur();
    } else if (event.key === " ") {
      // Sur un bouton, la barre d'espace « clique » au lieu d'écrire : on insère l'espace nous-mêmes.
      event.preventDefault();
      insertSpace();
      onInput();
    }
  };
  // Pendant l'édition, un clic place le curseur : il ne doit ni suivre un lien ni déclencher le bouton.
  const blockActivation = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
  };
  const finish = (): void => {
    element.removeAttribute("contenteditable");
    element.removeEventListener("input", onInput);
    element.removeEventListener("keydown", onKey);
    element.removeEventListener("blur", finish);
    element.removeEventListener("click", blockActivation, true);
    element.removeEventListener("keyup", blockSpaceUp, true);
    editing = null;
    onText(readText(element));
    onEnd();
  };
  element.addEventListener("input", onInput);
  element.addEventListener("keydown", onKey);
  element.addEventListener("blur", finish);
  element.addEventListener("click", blockActivation, true);
  element.addEventListener("keyup", blockSpaceUp, true);
}

function blockSpaceUp(event: KeyboardEvent): void {
  if (event.key === " ") event.preventDefault();
}

/** Insère une espace au curseur, dans le nœud texte existant quand c'est possible. */
function insertSpace(): void {
  const selection = window.getSelection();
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  if (!selection || !range) return;
  range.deleteContents();
  const node = range.startContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    const offset = range.startOffset;
    (node as Text).insertData(offset, " ");
    range.setStart(node, offset + 1);
  } else {
    const space = document.createTextNode(" ");
    range.insertNode(space);
    range.setStartAfter(space);
  }
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}
