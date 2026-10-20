import { effect, signal } from "@preact/signals";
import { changesToCss, LAYER_DECLARATION } from "../../shared/css";
import { changes, showOriginal } from "../state/changes";
import { buildSwapCss } from "./swap-css";
import { OWN_NODE_PREFIX, scanStylesheets, type SheetScan } from "./stylesheet-scan";

/** Dernière lecture des feuilles de style du site (relue quand le site recharge ses styles). */
export const sheetScan = signal<SheetScan>({ declarations: [], variables: [], tokens: [], usage: new Map() });

const LAYERS_ID = `${OWN_NODE_PREFIX}-layers`;
const OVERRIDES_ID = `${OWN_NODE_PREFIX}-overrides`;

function ensureStyle(id: string, atStart: boolean): HTMLStyleElement {
  const existing = document.getElementById(id);
  if (existing instanceof HTMLStyleElement && existing.isConnected) return existing;
  const style = document.createElement("style");
  style.id = id;
  const parent = document.head ?? document.documentElement;
  if (atStart) parent.prepend(style);
  else parent.append(style);
  return style;
}

function render(): void {
  const layers = ensureStyle(LAYERS_ID, true);
  if (layers.textContent !== LAYER_DECLARATION) layers.textContent = LAYER_DECLARATION;
  const overrides = ensureStyle(OVERRIDES_ID, false);
  const list = changes.value;
  const css = showOriginal.value
    ? ""
    : `${changesToCss(list)}\n${buildSwapCss(sheetScan.value, list.filter((change) => change.group === "swap"))}`;
  if (overrides.textContent !== css) overrides.textContent = css;
}

function isOwnMutation(record: MutationRecord): boolean {
  const node = record.target instanceof Element ? record.target : record.target.parentElement;
  if (node?.id.startsWith(OWN_NODE_PREFIX)) return true;
  const nodes = [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)];
  return nodes.length > 0 && nodes.every((added) => added instanceof Element && added.id.startsWith(OWN_NODE_PREFIX));
}

/** Applique les retouches en direct et suit les rechargements de styles du site (HMR). */
export function startOverrides(): void {
  sheetScan.value = scanStylesheets();
  effect(render);
  let timer: number | undefined;
  const rescan = (): void => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      sheetScan.value = scanStylesheets();
      render();
    }, 250);
  };
  const observer = new MutationObserver((records) => {
    if (records.some((record) => !isOwnMutation(record))) rescan();
    else if (!document.getElementById(OVERRIDES_ID) || !document.getElementById(LAYERS_ID)) render();
  });
  observer.observe(document.head ?? document.documentElement, { childList: true, subtree: true, characterData: true });
  window.addEventListener("load", rescan);
  document.addEventListener("load", (event) => {
    if (event.target instanceof HTMLLinkElement) rescan();
  }, true);
}
