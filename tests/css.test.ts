import { describe, expect, it } from "vitest";
import { changeKey, changesToCss, fontFamilyValue, isSafeCss, LAYER_DECLARATION } from "../src/shared/css";
import type { Change } from "../src/shared/types";

function change(partial: Partial<Change>): Change {
  return {
    id: "c1",
    group: "inspect",
    target: { selector: "button", label: "Boutons", scope: "tag", context: null },
    property: "border-radius",
    value: "12px",
    previous: "4px",
    font: null,
    ...partial,
  };
}

describe("changesToCss", () => {
  it("range chaque groupe dans sa couche, en !important", () => {
    const css = changesToCss([
      change({}),
      change({ group: "fonts", target: { selector: "h1, h2", label: "Titres", scope: "role", context: null }, property: "font-weight", value: "700" }),
    ]);
    expect(css).toContain("@layer od-inspect {\n  button { border-radius: 12px !important; }\n}");
    expect(css).toContain("@layer od-fonts {\n  h1, h2 { font-weight: 700 !important; }\n}");
    expect(css.indexOf("od-inspect")).toBeLessThan(css.indexOf("od-fonts"));
  });

  it("regroupe les déclarations d'un même sélecteur", () => {
    const css = changesToCss([change({}), change({ property: "padding-top", value: "8px" })]);
    expect(css).toContain("button { border-radius: 12px !important; padding-top: 8px !important; }");
  });

  it("ignore les échanges de couleur (gérés à part) et les valeurs dangereuses", () => {
    const css = changesToCss([
      change({ group: "swap", property: "color", value: "#fff" }),
      change({ group: "text", property: "text", value: "Nouveau titre" }),
      change({ value: "red; } body { display:none" }),
      change({ target: { selector: "a{}", label: "x", scope: "tag", context: null } }),
    ]);
    expect(css).toBe("");
  });
});

describe("outils CSS", () => {
  it("déclare les couches dans l'ordre de priorité", () => {
    expect(LAYER_DECLARATION).toBe("@layer od-inspect, od-system, od-fonts, od-vars, od-swap;");
  });

  it("distingue les échanges de couleur par couleur d'origine", () => {
    const a = change({ group: "swap", previous: "#000000" });
    const b = change({ group: "swap", previous: "#ffffff" });
    expect(changeKey(a)).not.toBe(changeKey(b));
    expect(changeKey(change({ previous: "1px" }))).toBe(changeKey(change({ previous: "2px" })));
  });

  it("refuse ce qui sortirait d'une déclaration", () => {
    expect(isSafeCss("12px")).toBe(true);
    expect(isSafeCss('"Inter", sans-serif')).toBe(true);
    expect(isSafeCss("1px; color: red")).toBe(false);
    expect(isSafeCss("</style>")).toBe(false);
    expect(isSafeCss("a /* b")).toBe(false);
  });

  it("ajoute une police de secours selon la catégorie", () => {
    expect(fontFamilyValue("Literata Display", "Serif")).toBe('"Literata Display", serif');
    expect(fontFamilyValue('Bad"Name', null)).toBe('"BadName", sans-serif');
  });
});
