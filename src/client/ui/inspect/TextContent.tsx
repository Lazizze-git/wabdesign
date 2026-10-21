import { stopInspecting } from "../../state/inspector";
import { t } from "../../i18n";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { changeKey } from "../../../shared/css";
import type { Target } from "../../../shared/types";
import { describeElement, humanLabel, uniqueSelector } from "../../engine/selector";
import { editInPage, isTextEditable, readText } from "../../engine/text-overrides";
import { changes, removeChange, upsertChange } from "../../state/changes";
import { uid } from "../../state/toasts";

function textTarget(element: Element): Target {
  const selector = uniqueSelector(element);
  return { selector, label: humanLabel(element), scope: "element", context: describeElement(element, selector) };
}

/** Réécrire le texte d'un élément : dans le panneau, ou directement dans la page. */
export function TextContent({ element }: { element: Element }): JSX.Element | null {
  // null = pas de saisie en cours : le champ affiche toujours le texte réel.
  const [draft, setDraft] = useState<string | null>(null);
  const [inPage, setInPage] = useState(false);
  const target = textTarget(element);
  const change = changes.value.find((item) => item.group === "text" && item.target.selector === target.selector);
  const original = change?.previous ?? readText(element);
  const current = change?.value ?? readText(element);

  if (!original.trim() && !change) return null;
  if (!isTextEditable(element)) {
    return (
      <section class="section">
        <span class="section-title">{t("inspect.content")}</span>
        <p class="hint" style="margin:6px 0 0">{t("inspect.contentNested")}</p>
      </section>
    );
  }

  const setText = (text: string): void => {
    if (text === original) {
      if (change) removeChange(changeKey(change));
      return;
    }
    upsertChange({ id: uid("chg"), group: "text", target, property: "text", value: text, previous: original, font: null });
  };

  const startInPage = (): void => {
    if (!(element instanceof HTMLElement)) return;
    stopInspecting(); // Les clics doivent placer le curseur dans le texte, pas sélectionner.
    setInPage(true);
    editInPage(element, setText, () => setInPage(false));
  };

  return (
    <section class="section stack">
      <div class="section-head" style="margin:0">
        <span class="section-title">
          {t("inspect.content")}{change && <span class="changed"> •</span>}
        </span>
        {change && (
          <button type="button" class="btn btn-ghost" onClick={() => removeChange(changeKey(change))}>
            {t("common.reset")}
          </button>
        )}
      </div>
      <textarea
        class="textarea"
        rows={Math.min(6, Math.max(2, Math.ceil(current.length / 38)))}
        value={draft ?? current}
        disabled={inPage}
        aria-label={t("inspect.textLabel")}
        onInput={(event) => {
          setDraft(event.currentTarget.value);
          setText(event.currentTarget.value);
        }}
        onBlur={() => setDraft(null)}
      />
      <button type="button" class={`btn btn-block${inPage ? " btn-primary" : ""}`} onClick={startInPage} disabled={inPage}>
        {inPage ? t("inspect.writingInPage") : t("inspect.writeInPage")}
      </button>
    </section>
  );
}
