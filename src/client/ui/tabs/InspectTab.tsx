import { t } from "../../i18n";
import type { JSX } from "preact";
import type { TargetScope } from "../../../shared/types";
import { createBinding } from "../../state/binding";
import { removeWhere } from "../../state/changes";
import {
  currentTarget,
  inspecting,
  scope,
  scopeOptions,
  select,
  selected,
  selectParent,
  startInspecting,
  stopInspecting,
} from "../../state/inspector";
import { Segmented } from "../controls/Segmented";
import { TypeControls } from "../fonts/TypeControls";
import { Icon } from "../icons";
import { BoxControls } from "../inspect/BoxControls";
import { TextContent } from "../inspect/TextContent";

function PickButton(): JSX.Element {
  return (
    <button
      type="button"
      class={`btn btn-block${inspecting.value ? " btn-primary" : ""}`}
      onClick={() => (inspecting.value ? stopInspecting() : startInspecting())}
    >
      <Icon name="cursor" size={14} />
      {inspecting.value ? t("inspect.picking") : t("inspect.pick")}
    </button>
  );
}

export function InspectTab(): JSX.Element {
  const element = selected.value;
  const target = currentTarget.value;
  if (!element || !target) {
    return (
      <section class="section stack">
        <PickButton />
        <p class="hint">{t("inspect.intro")}</p>
      </section>
    );
  }

  const options = scopeOptions(element);
  const binding = createBinding("inspect", target, element);
  const resetAll = (): void => removeWhere((change) => change.group === "inspect" && change.target.selector === target.selector);

  return (
    <>
      <section class="section stack">
        <PickButton />
        <div class="row">
          <span class="grow truncate" title={target.selector} style="font-weight:600">
            {target.label}
          </span>
          <button type="button" class="icon-btn sm" onClick={selectParent} title={t("inspect.parent")} aria-label={t("inspect.parent")}>
            <Icon name="up" size={13} />
          </button>
          <button type="button" class="icon-btn sm" onClick={() => select(null)} title={t("inspect.deselect")} aria-label={t("inspect.deselect")}>
            <Icon name="close" size={13} />
          </button>
        </div>
        <Segmented<TargetScope>
          label={t("inspect.scope")}
          options={options.map((option) => ({
            value: option.scope,
            label: option.scope === "element" ? option.label : `${option.label} · ${option.count}`,
            title: option.selector,
          }))}
          value={target.scope}
          onChange={(value) => (scope.value = value)}
        />
        <div class="row">
          <span class="muted mono grow truncate" title={target.selector}>
            {target.selector}
          </span>
          <button type="button" class="btn btn-ghost" onClick={resetAll}>
            {t("common.resetAll")}
          </button>
        </div>
      </section>
      <TextContent key={target.selector} element={element} />
      <section class="section">
        <div class="section-head">
          <span class="section-title">{t("inspect.typography")}</span>
        </div>
        <TypeControls binding={binding} title={target.label} showSize />
      </section>
      <BoxControls binding={binding} />
    </>
  );
}
