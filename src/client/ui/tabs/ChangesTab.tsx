import { propertyLabel } from "../../engine/property-names";
import { friendlyTokenName } from "../../engine/token-names";
import { t, type MessageKey } from "../../i18n";
import type { JSX } from "preact";
import { changeKey } from "../../../shared/css";
import type { Change, ChangeGroup } from "../../../shared/types";
import { colorKey } from "../../engine/colors";
import { changes, clearChanges, removeChange } from "../../state/changes";
import { highlightSelector } from "../../state/inspector";
import { Swatch } from "../controls/Swatch";
import { Icon } from "../icons";

const GROUPS: readonly { group: ChangeGroup; title: MessageKey }[] = [
  { group: "fonts", title: "changes.fonts" },
  { group: "system", title: "changes.system" },
  { group: "vars", title: "changes.vars" },
  { group: "swap", title: "changes.swap" },
  { group: "inspect", title: "changes.inspect" },
  { group: "text", title: "changes.text" },
];

function changeTitle(change: Change): string {
  if (change.group === "swap") return t("changes.colorTitle", { color: change.previous ?? "" });
  if (change.group === "vars") return friendlyTokenName(change.property);
  return change.target.label;
}

function ChangeItem({ change }: { change: Change }): JSX.Element {
  const highlightable = ["inspect", "system", "fonts", "text"].includes(change.group);
  const isColor = change.group === "swap" || (change.group !== "text" && colorKey(change.value) !== null);
  const showProperty = change.group !== "swap" && change.group !== "vars";
  return (
    <div
      class="change-item"
      onMouseEnter={() => (highlightSelector.value = highlightable ? change.target.selector : null)}
      onMouseLeave={() => (highlightSelector.value = null)}
    >
      <div class="grow" style="min-width:0">
        <div class="truncate change-title">{changeTitle(change)}</div>
        <div class="row" style="gap:4px">
          {showProperty && <span class="truncate">{propertyLabel(change)}</span>}
          {change.group === "text" && <span class="truncate">{t("changes.quoted", { text: change.value })}</span>}
          {isColor && change.previous && <Swatch color={change.previous} />}
          {isColor && <span class="arrow">→</span>}
          {isColor && <Swatch color={change.value} />}
          {isColor && <span class="truncate mono">{change.value}</span>}
          {!isColor && change.group !== "text" && <span class="truncate mono">→ {change.font?.family ?? change.value}</span>}
        </div>
      </div>
      <button type="button" class="icon-btn sm" onClick={() => removeChange(changeKey(change))} aria-label={t("changes.remove")}>
        <Icon name="close" size={13} />
      </button>
    </div>
  );
}

export function ChangesTab(): JSX.Element {
  const list = changes.value;
  if (list.length === 0) {
    return <p class="empty">{t("changes.empty")}</p>;
  }
  return (
    <>
      {GROUPS.map(({ group, title }) => {
        const items = list.filter((change) => change.group === group);
        if (items.length === 0) return null;
        return (
          <section class="section" key={group}>
            <div class="section-head">
              <span class="section-title">{t(title)}</span>
              <span class="muted">{items.length}</span>
            </div>
            {items.map((change) => (
              <ChangeItem key={changeKey(change)} change={change} />
            ))}
          </section>
        );
      })}
      <section class="section">
        <button type="button" class="btn btn-ghost btn-danger btn-block" onClick={clearChanges}>
          <Icon name="trash" size={14} /> {t("changes.clear")}
        </button>
      </section>
    </>
  );
}
