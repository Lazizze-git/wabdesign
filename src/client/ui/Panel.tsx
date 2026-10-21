import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import { t, tn, type MessageKey } from "../i18n";
import { canRedo, canUndo, changes, redo, showOriginal, undo } from "../state/changes";
import { toasts } from "../state/toasts";
import { activeTab, minimized, position, rememberUi, type TabId } from "../state/ui";
import { Icon } from "./icons";
import { ChangesTab } from "./tabs/ChangesTab";
import { ColorsTab } from "./tabs/ColorsTab";
import { FontsTab } from "./tabs/FontsTab";
import { InspectTab } from "./tabs/InspectTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { SystemTab } from "./tabs/SystemTab";
import { ValidateSheet } from "./ValidateSheet";

const TABS: readonly { id: Exclude<TabId, "settings">; label: MessageKey }[] = [
  { id: "fonts", label: "tab.fonts" },
  { id: "colors", label: "tab.colors" },
  { id: "inspect", label: "tab.inspect" },
  { id: "system", label: "tab.system" },
  { id: "changes", label: "tab.changes" },
];

const CONTENT: Record<TabId, () => JSX.Element> = {
  fonts: FontsTab,
  colors: ColorsTab,
  inspect: InspectTab,
  system: SystemTab,
  changes: ChangesTab,
  settings: SettingsTab,
};

function useDrag(): (event: PointerEvent) => void {
  const start = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  return (event: PointerEvent) => {
    if ((event.target as Element).closest("button")) return;
    const panel = (event.currentTarget as HTMLElement).parentElement;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    start.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    const move = (moveEvent: PointerEvent): void => {
      if (!start.current) return;
      const x = Math.min(window.innerWidth - 80, Math.max(0, start.current.left + moveEvent.clientX - start.current.x));
      const y = Math.min(window.innerHeight - 40, Math.max(0, start.current.top + moveEvent.clientY - start.current.y));
      position.value = { x, y };
    };
    const up = (): void => {
      start.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      rememberUi();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
}

function selectTab(id: TabId): void {
  activeTab.value = id;
  rememberUi();
}

export function Panel(): JSX.Element {
  const [validating, setValidating] = useState(false);
  const onDrag = useDrag();
  const count = changes.value.length;
  const Content = CONTENT[activeTab.value];

  if (minimized.value) {
    return (
      <button type="button" class="minimized" onClick={() => ((minimized.value = false), rememberUi())}>
        {t("panel.title")} {count > 0 && <span class="badge">{count}</span>}
      </button>
    );
  }

  const placed = position.value;
  const style = placed ? { left: `${placed.x}px`, top: `${placed.y}px`, right: "auto" } : undefined;

  return (
    <div class="panel" style={style} role="dialog" aria-label={t("panel.name")}>
      <div class="header" onPointerDown={onDrag}>
        <span class="title">{t("panel.title")}</span>
        <button type="button" class="icon-btn" onClick={undo} disabled={!canUndo.value} title={t("header.undoHint")} aria-label={t("header.undo")}>
          <Icon name="undo" />
        </button>
        <button type="button" class="icon-btn" onClick={redo} disabled={!canRedo.value} title={t("header.redoHint")} aria-label={t("header.redo")}>
          <Icon name="redo" />
        </button>
        <button
          type="button"
          class="icon-btn"
          aria-pressed={showOriginal.value}
          onClick={() => (showOriginal.value = !showOriginal.value)}
          title={t("header.originalHint")}
          aria-label={t("header.original")}
        >
          <Icon name="eye" />
        </button>
        <button type="button" class="icon-btn" aria-pressed={activeTab.value === "settings"} onClick={() => selectTab(activeTab.value === "settings" ? "fonts" : "settings")} title={t("header.settings")} aria-label={t("header.settings")}>
          <Icon name="settings" />
        </button>
        <button type="button" class="icon-btn" onClick={() => ((minimized.value = true), rememberUi())} title={t("header.minimizeHint")} aria-label={t("header.minimize")}>
          <Icon name="minimize" />
        </button>
      </div>
      <div class="tabs" role="tablist">
        {TABS.map((tab) => (
          <button type="button" role="tab" class="tab" key={tab.id} aria-selected={activeTab.value === tab.id} onClick={() => selectTab(tab.id)}>
            {t(tab.label)}
          </button>
        ))}
      </div>
      <div class="body" role="tabpanel">
        <Content />
      </div>
      <div class="footer">
        <span class="count">{showOriginal.value ? t("footer.original") : count === 0 ? t("footer.none") : tn(count, "footer.one", "footer.other")}</span>
        <button type="button" class="btn btn-primary" disabled={count === 0} onClick={() => setValidating(true)}>
          {t("footer.validate")}
        </button>
      </div>
      {validating && <ValidateSheet onClose={() => setValidating(false)} />}
      <div class="toasts" aria-live="polite">
        {toasts.value.map((toast) => (
          <div key={toast.id} class={`toast ${toast.tone}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
