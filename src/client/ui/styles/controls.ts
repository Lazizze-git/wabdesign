/**
 * Styles des contrôles. Règle de lisibilité (DESIGN.md) : sur le cadre gris, texte en encre ;
 * les gris secondaires n'existent que sur les surfaces claires (--well).
 */
export const controlsCss = `
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: var(--radius); border: 1px solid var(--edge); background: var(--well); font-weight: 500; white-space: nowrap; }
.btn:disabled { opacity: 0.45; cursor: default; }
.btn-primary { background: var(--ink); border-color: var(--ink); color: var(--on-ink); }
.btn-ghost { background: none; border-color: transparent; }
.btn-danger { background: var(--well); border-color: var(--edge); color: var(--danger); }
.btn-block { width: 100%; }
.icon-btn { display: inline-grid; place-items: center; width: 28px; height: 28px; border: 0; border-radius: var(--radius); background: none; flex: none; }
.icon-btn:disabled { opacity: 0.35; cursor: default; }
.icon-btn[aria-pressed="true"] { background: var(--well-hi); color: var(--accent); }
.icon-btn.sm { width: 24px; height: 24px; }

.field { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; min-width: 0; }
.label { font-size: 12px; font-weight: 500; user-select: none; }
.label.scrub { cursor: ew-resize; }
.changed { color: var(--accent); font-weight: 700; }
.input, .select, .textarea { width: 100%; height: 28px; padding: 0 8px; background: var(--well); border: 1px solid var(--edge); border-radius: var(--radius); }
.input::placeholder, .textarea::placeholder { color: var(--ink-3); }
.input:focus, .select:focus, .textarea:focus { border-color: var(--accent); }
.textarea { height: auto; min-height: 64px; padding: 6px 8px; resize: vertical; line-height: 1.45; }
.unit-input { display: flex; align-items: center; background: var(--well); border: 1px solid var(--edge); border-radius: var(--radius); }
.unit-input:focus-within { border-color: var(--accent); outline: 2px solid var(--accent); outline-offset: 1px; }
.unit-input .input:focus-visible { outline: none; }
.backdrop { position: fixed; inset: 0; z-index: 4; border: 0; padding: 0; background: none; cursor: default; }
.unit-input .input { background: none; border: 0; box-shadow: none; padding-right: 2px; }
.unit-input .unit { color: var(--ink-3); padding: 0 8px 0 2px; font-size: 12px; border: 0; background: none; height: 26px; }

.seg { display: flex; background: var(--well); border: 1px solid var(--edge); border-radius: var(--radius); padding: 2px; gap: 2px; }
.seg button { flex: 1; border: 0; background: none; color: var(--ink-2); height: 24px; border-radius: 3px; padding: 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.seg button[aria-pressed="true"] { background: var(--well-hi); color: var(--ink); font-weight: 600; box-shadow: inset 0 0 0 1px var(--edge); }

input[type="range"], input[type="checkbox"] { accent-color: var(--ink); margin: 0; }
input[type="range"] { width: 100%; }

.swatch { width: 22px; height: 22px; border-radius: 3px; border: 1px solid #6f6b80; flex: none; padding: 0; position: relative; overflow: hidden;
  background-image: linear-gradient(45deg, #9a96a8 25%, transparent 25%, transparent 75%, #9a96a8 75%), linear-gradient(45deg, #9a96a8 25%, transparent 25%, transparent 75%, #9a96a8 75%);
  background-color: #d4d1db; background-size: 8px 8px; background-position: 0 0, 4px 4px; background-clip: padding-box; }
.swatch > .fill { position: absolute; inset: 0; }
.swatch.lg { width: 28px; height: 28px; }
.swatch-row { display: flex; flex-wrap: wrap; gap: 4px; }
.swatch-btn { border: 0; padding: 0; background: none; border-radius: 3px; }
.swatch.armed { outline: 2px solid var(--accent); outline-offset: 2px; }

.color-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 4px; border: 0; background: none; border-radius: var(--radius); text-align: left; }
.color-row.boxed { background: var(--well); border: 1px solid var(--edge); }
.color-text { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; line-height: 1.3; }
.color-label { font-weight: 500; }
.color-sub { font-size: 12px; }
.label-row { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.label-code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11px; margin-left: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.color-row.target { outline: 1.5px dashed var(--accent); }

.popover { position: absolute; z-index: 5; left: 8px; right: 8px; background: var(--well-hi); border: 1px solid var(--edge); border-radius: 8px; padding: 12px; box-shadow: 0 12px 28px rgb(20 19 24 / 0.3); }
.popover .label { color: var(--ink-2); }
.sheet { position: absolute; inset: 0; z-index: 4; display: flex; flex-direction: column; }
.sheet-head { display: flex; align-items: center; gap: 6px; padding: 8px; border-bottom: 1px solid var(--rule); }

.font-list { overflow-y: auto; flex: 1; padding: 4px; scrollbar-width: thin; scrollbar-color: rgb(20 19 24 / 0.35) transparent; }
.font-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px; border: 0; background: none; border-radius: var(--radius); text-align: left; }
.font-row[aria-selected="true"] { background: var(--well-hi); box-shadow: inset 0 0 0 1.5px var(--accent); }
.font-name { font-size: 17px; line-height: 1.25; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tag { font-size: 11px; font-weight: 500; border: 1px solid rgb(20 19 24 / 0.3); border-radius: 3px; padding: 1px 5px; white-space: nowrap; }
.star[aria-pressed="true"] { color: var(--accent); }
.star[aria-pressed="true"] svg { fill: currentColor; }
.chip-row { display: flex; gap: 4px; flex-wrap: wrap; }
.chip { border: 1px solid var(--edge); background: var(--well); border-radius: var(--radius); padding: 3px 9px; font-weight: 500; }
.chip[aria-pressed="true"] { background: var(--ink); color: var(--on-ink); border-color: var(--ink); }
.picker-btn { display: flex; align-items: center; gap: 8px; width: 100%; height: 38px; padding: 0 10px; background: var(--well); border: 1px solid var(--edge); border-radius: var(--radius); text-align: left; }

.change-item { display: flex; gap: 8px; align-items: flex-start; padding: 6px; border-radius: var(--radius); }
.log { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; overflow-wrap: anywhere; max-height: 220px; overflow-y: auto; background: var(--well); border: 1px solid var(--edge); border-radius: var(--radius); padding: 10px; }
.log-line { color: var(--ink-2); }
.log-line.done { color: var(--ok); font-weight: 600; }
.log-line.error { color: var(--danger); font-weight: 600; }

/* Survols : seulement avec une vraie souris (pas de faux survol au toucher). */
@media (hover: hover) and (pointer: fine) {
  .btn:hover:not(:disabled) { background: var(--well-hi); }
  .btn-primary:hover:not(:disabled) { background: #2a2833; }
  .btn-ghost:hover:not(:disabled), .icon-btn:hover:not(:disabled), .tab:hover, .color-row:hover, .font-row:hover, .change-item:hover { background: rgb(20 19 24 / 0.08); }
  .color-row.boxed:hover, .picker-btn:hover, .input:hover, .select:hover, .unit-input:hover { border-color: var(--ink); }
  .swatch-btn:hover .swatch { outline: 2px solid var(--ink); outline-offset: 1px; }
  .chip:hover:not([aria-pressed="true"]) { border-color: var(--ink); }
}

/* Retour de pression (Emil Kowalski) : seulement si le mouvement n'est pas réduit. */
@media (prefers-reduced-motion: no-preference) {
  .btn, .icon-btn, .chip, .seg button, .picker-btn, .font-row, .color-row { transition: transform 120ms var(--ease-out), background-color 120ms ease; }
  .btn:active:not(:disabled), .icon-btn:active:not(:disabled), .chip:active, .seg button:active, .picker-btn:active { transform: scale(0.97); }
}
`;
