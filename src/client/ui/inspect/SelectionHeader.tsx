import type { JSX } from "preact";
import type { Target, TargetScope } from "../../../shared/types";
import { elementName, uniqueSelector } from "../../engine/selector";
import { t } from "../../i18n";
import { changes, removeWhere } from "../../state/changes";
import { highlightSelector, scope, scopeOptions, select } from "../../state/inspector";
import { getHost } from "../../state/ui";
import { Icon } from "../icons";

const PATH_DEPTH = 4;

/** Les ancêtres de l’élément (du plus éloigné au plus proche), sans <html> ni <body>. */
function ancestry(element: Element): Element[] {
  const path: Element[] = [];
  let current: Element | null = element;
  while (current && current !== document.body && current !== document.documentElement && path.length < PATH_DEPTH) {
    if (!getHost()?.contains(current)) path.unshift(current);
    current = current.parentElement;
  }
  return path;
}

/** Fil d’Ariane cliquable : on voit où est l’élément et on remonte d’un clic au parent voulu. */
function Breadcrumb({ element }: { element: Element }): JSX.Element {
  return (
    <nav class="crumbs" aria-label={t("inspect.path")}>
      {ancestry(element).map((node, index, all) => {
        const current = index === all.length - 1;
        return (
          <span class="crumb-item" key={index}>
            {index > 0 && <span class="crumb-sep" aria-hidden="true">›</span>}
            <button
              type="button"
              class="crumb"
              aria-current={current ? "true" : undefined}
              onClick={() => select(node)}
              onMouseEnter={() => (highlightSelector.value = uniqueSelector(node))}
              onMouseLeave={() => (highlightSelector.value = null)}
            >
              {elementName(node)}
            </button>
          </span>
        );
      })}
    </nav>
  );
}

/** « S’applique à » : la portée de la retouche, en toutes lettres. */
function ScopeChooser({ element, target }: { element: Element; target: Target }): JSX.Element {
  return (
    <div class="scope-list" role="radiogroup" aria-label={t("inspect.appliesTo")}>
      {scopeOptions(element).map((option) => (
        <button
          type="button"
          role="radio"
          key={option.scope}
          class="scope-option"
          aria-checked={target.scope === option.scope}
          title={option.selector}
          onClick={() => (scope.value = option.scope as TargetScope)}
        >
          <span class="radio" aria-hidden="true" />
          <span class="truncate">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

/** En-tête de l’inspecteur : quel élément, où il est, et à quoi s’appliquent les retouches. */
export function SelectionHeader({ element, target }: { element: Element; target: Target }): JSX.Element {
  const hasChanges = changes.value.some((change) => change.group === "inspect" && change.target.selector === target.selector);
  const resetAll = (): void => removeWhere((change) => change.group === "inspect" && change.target.selector === target.selector);
  return (
    <>
      <Breadcrumb element={element} />
      <div class="row">
        <span class="grow truncate selection-title" title={target.selector}>
          {target.label}
        </span>
        {hasChanges && (
          <button type="button" class="btn btn-ghost" onClick={resetAll}>
            {t("common.resetAll")}
          </button>
        )}
        <button type="button" class="icon-btn sm" onClick={() => select(null)} title={t("inspect.deselect")} aria-label={t("inspect.deselect")}>
          <Icon name="close" size={13} />
        </button>
      </div>
      <div class="field">
        <span class="label">{t("inspect.appliesTo")}</span>
        <ScopeChooser element={element} target={target} />
      </div>
    </>
  );
}
