import { t } from "../../i18n";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { sampleElement } from "../../engine/roles";
import { SYSTEM_GROUPS, type SystemSetting } from "../../engine/system-settings";
import { createBinding, computedValue } from "../../state/binding";
import { removeWhere } from "../../state/changes";
import { getHost } from "../../state/ui";
import { siteTokens } from "../../state/tokens";
import { NumberField } from "../controls/NumberField";
import { Segmented } from "../controls/Segmented";
import { TokensSection } from "../system/TokensSection";

type View = "tokens" | "elements";

/** Valeur affichée : l’interligne calculé (en px) est ramené à un multiple de la taille du texte. */
function displayValue(setting: SystemSetting, value: string, sample: Element | null, changed: boolean): string {
  if (changed || setting.units[0] !== "" || !value.endsWith("px")) return value === "normal" ? "1.2" : value;
  const size = parseFloat(computedValue(sample, "font-size")) || 16;
  return String(Math.round((parseFloat(value) / size) * 100) / 100);
}

function SettingField({ setting }: { setting: SystemSetting }): JSX.Element | null {
  const sample = sampleElement(setting.sample, getHost());
  const target = { selector: setting.selector, label: t(setting.label), scope: "global" as const, context: null };
  const binding = createBinding("system", target, sample);
  const changed = binding.isChanged(setting.property);
  const raw = changed ? binding.get(setting.property) : computedValue(sample, setting.readProperty ?? setting.property);
  if (!sample && !changed) return null;
  return (
    <NumberField
      label={t(setting.label)}
      property={setting.property}
      value={displayValue(setting, raw, sample, changed)}
      units={setting.units}
      step={setting.step ?? 1}
      min={setting.min}
      changed={changed}
      onChange={(value) => binding.set(setting.property, value)}
    />
  );
}

function ElementSettings(): JSX.Element {
  return (
    <>
      <section class="section">
        <p class="hint" style="margin:0">{t("system.elementsHint")}</p>
      </section>
      {SYSTEM_GROUPS.map((group) => (
        <section class="section stack" key={group.title}>
          <div class="section-head" style="margin:0">
            <span class="section-title">{t(group.title)}</span>
            <button
              type="button"
              class="btn btn-ghost"
              onClick={() =>
                removeWhere((change) => change.group === "system" && group.settings.some((s) => s.selector === change.target.selector))
              }
            >
              {t("common.reset")}
            </button>
          </div>
          <div class="grid-2">
            {group.settings.map((setting) => (
              <SettingField key={setting.id} setting={setting} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

/** Design system : les variables du site, et des réglages par type d’élément. */
export function SystemTab(): JSX.Element {
  const [view, setView] = useState<View>(siteTokens.value.length > 0 ? "tokens" : "elements");
  return (
    <>
      <section class="section">
        <Segmented<View>
          label={t("system.view")}
          options={[
            { value: "tokens", label: t("system.viewTokens", { n: siteTokens.value.length }) },
            { value: "elements", label: t("system.viewElements") },
          ]}
          value={view}
          onChange={setView}
        />
      </section>
      {view === "tokens" ? <TokensSection /> : <ElementSettings />}
    </>
  );
}
