import { t } from "../../i18n";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { parsePaletteInput } from "../../engine/colors";
import { config } from "../../state/library";
import { addPalette, armedColor, deletePalette, tryPalette } from "../../state/palettes";
import { notify } from "../../state/toasts";
import { Swatch } from "../controls/Swatch";
import { Icon } from "../icons";

function NewPaletteForm({ onDone }: { onDone: () => void }): JSX.Element {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const colors = parsePaletteInput(text);
  const submit = (event: Event): void => {
    event.preventDefault();
    if (colors.length === 0) {
      notify(t("palettes.noColor"), "error");
      return;
    }
    addPalette(name, colors);
    onDone();
  };
  return (
    <form class="stack" onSubmit={submit}>
      <input class="input" placeholder={t("palettes.name")} value={name} onInput={(e) => setName(e.currentTarget.value)} />
      <textarea
        class="textarea mono"
        placeholder={t("palettes.paste")}
        value={text}
        onInput={(e) => setText(e.currentTarget.value)}
      />
      {colors.length > 0 && (
        <div class="swatch-row">
          {colors.map((color) => (
            <Swatch key={color} color={color} />
          ))}
        </div>
      )}
      <div class="row">
        <button type="button" class="btn btn-ghost grow" onClick={onDone}>
          {t("common.cancel")}
        </button>
        <button type="submit" class="btn btn-primary grow" disabled={colors.length === 0}>
          {t("common.add")}
        </button>
      </div>
    </form>
  );
}

/** Mes palettes : cliquer une pastille la « prend en main », puis on clique une couleur du site. */
export function PalettesSection(): JSX.Element {
  const [adding, setAdding] = useState(false);
  const palettes = config.value?.palettes ?? [];
  return (
    <section class="section">
      <div class="section-head">
        <span class="section-title">{t("palettes.title")}</span>
        {!adding && (
          <button type="button" class="btn" onClick={() => setAdding(true)}>
            <Icon name="plus" size={14} /> {t("palettes.new")}
          </button>
        )}
      </div>
      {adding && <NewPaletteForm onDone={() => setAdding(false)} />}
      {!adding && palettes.length === 0 && <p class="hint">{t("palettes.empty")}</p>}
      {armedColor.value && (
        <p class="hint row">
          <Swatch color={armedColor.value} /> {t("palettes.armed")}
          <button type="button" class="btn btn-ghost" onClick={() => (armedColor.value = null)}>
            {t("common.cancel")}
          </button>
        </p>
      )}
      <div class="stack">
        {palettes.map((palette) => (
          <div class="field" key={palette.id}>
            <div class="row">
              <span class="label grow truncate">{palette.name}</span>
              <button type="button" class="btn btn-ghost" onClick={() => tryPalette(palette)} title={t("palettes.tryHint")}>
                {t("palettes.try")}
              </button>
              <button type="button" class="icon-btn sm" onClick={() => deletePalette(palette.id)} aria-label={t("palettes.delete", { name: palette.name })}>
                <Icon name="trash" size={13} />
              </button>
            </div>
            <div class="swatch-row">
              {palette.colors.map((color) => (
                <button
                  type="button"
                  class="swatch-btn"
                  key={color}
                  title={t("palettes.swatchHint", { color })}
                  onClick={() => (armedColor.value = armedColor.value === color ? null : color)}
                  draggable
                  onDragStart={(event) => event.dataTransfer?.setData("text/plain", color)}
                >
                  <Swatch color={color} large armed={armedColor.value === color} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
