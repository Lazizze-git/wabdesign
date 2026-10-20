import type { JSX } from "preact";
import { render } from "preact";
import { startFontSync } from "./engine/font-sync";
import { startOverrides } from "./engine/overrides";
import { startPageWatch } from "./engine/page-watch";
import { startTextOverrides } from "./engine/text-overrides";
import { OWN_NODE_PREFIX } from "./engine/stylesheet-scan";
import { startShortcuts } from "./shortcuts";
import { restoreSession } from "./state/changes";
import { loadLibrary } from "./state/library";
import { refreshVisibleColors } from "./state/palettes";
import { hidden, setHost } from "./state/ui";
import { Highlights } from "./ui/Highlights";
import { Panel } from "./ui/Panel";
import { baseCss } from "./ui/styles/base";
import { controlsCss } from "./ui/styles/controls";

const HOST_ID = `${OWN_NODE_PREFIX}-host`;

function App(): JSX.Element {
  return (
    <div class="root">
      <Highlights />
      {!hidden.value && <Panel />}
    </div>
  );
}

/**
 * Le panneau vit dans un Shadow DOM accroché à <html> (et non à <body>, que certains
 * frameworks remplacent) : ses styles et ceux du site ne se mélangent jamais.
 */
function mount(): void {
  if (document.getElementById(HOST_ID)) return;
  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.append(host);
  setHost(host);
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = baseCss + controlsCss;
  shadow.append(style);
  const container = document.createElement("div");
  shadow.append(container);
  render(<App />, container);

  // Si le site retire le panneau en se re-rendant, on le remet.
  new MutationObserver(() => {
    if (!host.isConnected) document.documentElement.append(host);
  }).observe(document.documentElement, { childList: true });
}

async function start(): Promise<void> {
  if (window.top !== window) return; // Pas dans les iframes de la page.
  startOverrides();
  startTextOverrides();
  startPageWatch();
  refreshVisibleColors();
  startShortcuts();
  mount();
  await restoreSession();
  startFontSync();
  await loadLibrary();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => void start(), { once: true });
} else {
  void start();
}
