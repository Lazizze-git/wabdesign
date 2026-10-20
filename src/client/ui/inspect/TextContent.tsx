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
        <span class="section-title">Contenu</span>
        <p class="hint" style="margin:6px 0 0">Ce bloc contient d’autres éléments : clique directement sur le texte à modifier.</p>
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
    setInPage(true);
    editInPage(element, setText, () => setInPage(false));
  };

  return (
    <section class="section stack">
      <div class="section-head" style="margin:0">
        <span class="section-title">
          Contenu{change && <span class="changed"> •</span>}
        </span>
        {change && (
          <button type="button" class="btn btn-ghost" onClick={() => removeChange(changeKey(change))}>
            Rétablir
          </button>
        )}
      </div>
      <textarea
        class="textarea"
        rows={Math.min(6, Math.max(2, Math.ceil(current.length / 38)))}
        value={draft ?? current}
        disabled={inPage}
        aria-label="Texte de l’élément"
        onInput={(event) => {
          setDraft(event.currentTarget.value);
          setText(event.currentTarget.value);
        }}
        onBlur={() => setDraft(null)}
      />
      <button type="button" class={`btn btn-block${inPage ? " btn-primary" : ""}`} onClick={startInPage} disabled={inPage}>
        {inPage ? "Écris dans la page… (Entrée ou Échap pour finir)" : "Écrire directement dans la page"}
      </button>
    </section>
  );
}
