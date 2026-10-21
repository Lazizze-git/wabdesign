import { t } from "../../i18n";
import type { JSX } from "preact";
import { createBinding } from "../../state/binding";
import { currentTarget, inspecting, selected, startInspecting, stopInspecting } from "../../state/inspector";
import { TypeControls } from "../fonts/TypeControls";
import { Icon } from "../icons";
import { BoxControls } from "../inspect/BoxControls";
import { SelectionHeader } from "../inspect/SelectionHeader";
import { TextContent } from "../inspect/TextContent";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function PickButton(): JSX.Element {
  return (
    <button
      type="button"
      class={`btn btn-block${inspecting.value ? " btn-primary" : ""}`}
      onClick={() => (inspecting.value ? stopInspecting() : startInspecting())}
    >
      <Icon name="cursor" size={14} />
      <span class="grow">{inspecting.value ? t("inspect.picking") : t("inspect.pick")}</span>
      {!inspecting.value && <kbd class="kbd">{IS_MAC ? "⌥ S" : "Alt S"}</kbd>}
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

  const binding = createBinding("inspect", target, element);

  return (
    <>
      <section class="section stack">
        <PickButton />
        <SelectionHeader element={element} target={target} />
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
