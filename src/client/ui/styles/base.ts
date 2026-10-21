/**
 * Styles du panneau (isolés dans un Shadow DOM : ils ne touchent pas au site, et inversement).
 * Chaque valeur est justifiée dans DESIGN.md ; les paires de contraste sont dans paires.txt.
 */
export const baseCss = `
:host { all: initial; }
* { box-sizing: border-box; }
.root {
  --frame: #b1aebc; --ink: #141318; --well: #dcdae2; --well-hi: #efeef3; --edge: #5a566b;
  --ink-2: #3d3a4a; --ink-3: #56526a; --rule: rgb(20 19 24 / 0.16);
  --accent: #0a3fb8; --danger: #7a1e10; --ok: #0b4a2a; --on-ink: #f3f2f6;
  --radius: 4px; --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  /* Verre dépoli (demande d'Eliott) : le site derrière est éclairci et adouci avant le flou,
     pour que le cadre ne soit jamais plus sombre que --frame (contraste vérifié, DESIGN.md). */
  --glass: rgb(177 174 188 / 0.7);
  --glass-filter: blur(22px) contrast(0.2) brightness(1.75) saturate(1.4);
  font: 13px/1.4 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  font-variant-numeric: tabular-nums;
}
button, input, select, textarea { font: inherit; color: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
::selection { background: rgb(10 63 184 / 0.22); }

.panel {
  position: fixed; z-index: 2147483646; top: 12px; right: 12px;
  width: 360px; max-width: calc(100vw - 24px); max-height: calc(100vh - 24px);
  display: flex; flex-direction: column;
  border: 1px solid rgb(20 19 24 / 0.28); border-radius: 10px;
  box-shadow: 0 14px 36px rgb(20 19 24 / 0.28), 0 2px 6px rgb(20 19 24 / 0.16);
  overflow: hidden;
}
.header { display: flex; align-items: center; gap: 2px; padding: 6px 6px 6px 14px; border-bottom: 1px solid var(--rule); cursor: grab; user-select: none; }
.header:active { cursor: grabbing; }
.title { font-weight: 600; font-size: 14px; flex: 1; }
.tabs { display: flex; gap: 0; padding: 6px; border-bottom: 1px solid var(--rule); }
.tab { flex: auto; border: 0; background: none; padding: 6px 5px; border-radius: var(--radius); font-size: 12.5px; font-weight: 500; white-space: nowrap; }
.tab[aria-selected="true"] { background: var(--well-hi); box-shadow: inset 0 0 0 1px var(--edge); }
.body { overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; flex: 1; min-height: 120px; scrollbar-width: thin; scrollbar-color: rgb(20 19 24 / 0.35) transparent; }
.footer { display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 14px; border-top: 1px solid var(--rule); }
.footer .count { flex: 1; font-weight: 500; }

.section { padding: 16px 14px 14px; border-bottom: 1px solid var(--rule); min-width: 0; }
.section:last-child { border-bottom: 0; }
.section-head { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.section-title { font-weight: 600; font-size: 14px; flex: 1; }
.hint { margin: 0 0 8px; font-size: 12px; }
.empty { padding: 24px 14px; text-align: center; }
/* minmax(0, …) : un texte long ne peut jamais élargir une colonne au-delà du panneau. */
.stack { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.row { display: flex; align-items: center; gap: 6px; }
.grow { flex: 1; min-width: 0; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.muted { font-weight: 500; }
.mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 12px; }

.panel, .minimized, .sheet { background: var(--glass); -webkit-backdrop-filter: var(--glass-filter); backdrop-filter: var(--glass-filter); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .panel, .minimized, .sheet { background: var(--frame); }
}
@media (prefers-reduced-transparency: reduce) {
  .panel, .minimized, .sheet { background: var(--frame); -webkit-backdrop-filter: none; backdrop-filter: none; }
}

.minimized {
  position: fixed; z-index: 2147483646; right: 12px; bottom: 12px;
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  border: 1px solid rgb(20 19 24 / 0.28); border-radius: 8px;
  box-shadow: 0 8px 24px rgb(20 19 24 / 0.26); font-weight: 600;
}
.badge { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 3px; background: var(--ink); color: var(--on-ink); font-size: 11px; font-weight: 600; display: inline-grid; place-items: center; }

.toasts { position: absolute; left: 8px; right: 8px; bottom: 56px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; pointer-events: none; }
.toast { overflow-wrap: anywhere; background: var(--ink); color: var(--on-ink); border-radius: 6px; padding: 9px 12px; box-shadow: 0 6px 16px rgb(20 19 24 / 0.3); }
.toast.error { background: var(--danger); }

/* Cadres dans la page : accent doublé de blanc pour rester visibles sur un site clair ou sombre. */
.highlight { position: fixed; z-index: 2147483645; pointer-events: none; border: 1.5px solid var(--accent); box-shadow: 0 0 0 1px rgb(255 255 255 / 0.9); background: rgb(10 63 184 / 0.06); border-radius: 2px; }
.highlight.secondary { border-style: dashed; background: none; }
.highlight-tag { position: absolute; top: -22px; left: -1.5px; background: var(--accent); color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 12px; white-space: nowrap; }
`;
