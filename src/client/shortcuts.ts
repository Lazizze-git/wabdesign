import { redo, showOriginal, undo } from "./state/changes";
import { clearInspection, inspecting, selected, startInspecting } from "./state/inspector";
import { activeTab, getHost, hidden, minimized, rememberUi } from "./state/ui";

/** Vrai si l'utilisateur tape dans un champ du site (on ne lui vole pas ses raccourcis). */
function isTypingInPage(event: KeyboardEvent): boolean {
  const host = getHost();
  if (host && event.composedPath().includes(host)) return false;
  const target = event.composedPath()[0];
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

function isTypingInPanel(event: KeyboardEvent): boolean {
  const target = event.composedPath()[0];
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/** Une liste de polices ou un choix de couleur ouvert gère lui-même Échap (il se ferme). */
function panelOverlayOpen(): boolean {
  return getHost()?.shadowRoot?.querySelector(".popover, .sheet") != null;
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === "Escape" && selected.value && !inspecting.value && !panelOverlayOpen() && !isTypingInPage(event) && !isTypingInPanel(event)) {
    clearInspection();
    return;
  }
  // event.code : indépendant du caractère produit par Option (∂, ß, å…).
  if (event.altKey && !event.metaKey && !event.ctrlKey) {
    if (event.code === "KeyD") {
      event.preventDefault();
      hidden.value = !hidden.value;
      rememberUi();
    } else if (event.code === "KeyS") {
      event.preventDefault();
      hidden.value = false;
      minimized.value = false;
      activeTab.value = "inspect";
      startInspecting();
    } else if (event.code === "KeyA") {
      event.preventDefault();
      showOriginal.value = true;
    }
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.code === "KeyZ" && !isTypingInPage(event) && !isTypingInPanel(event)) {
    event.preventDefault();
    if (event.shiftKey) redo();
    else undo();
  }
}

function onKeyUp(event: KeyboardEvent): void {
  if (event.code === "KeyA" || event.key === "Alt") showOriginal.value = false;
}

export function startShortcuts(): void {
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
  window.addEventListener("blur", () => (showOriginal.value = false));
}
