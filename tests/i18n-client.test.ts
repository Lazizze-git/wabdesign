import { describe, expect, it } from "vitest";
import { colorsText } from "../src/client/i18n/messages/colors";
import { fontsText } from "../src/client/i18n/messages/fonts";
import { inspectText } from "../src/client/i18n/messages/inspect";
import { settingsText } from "../src/client/i18n/messages/settings";
import { shell } from "../src/client/i18n/messages/shell";
import { systemText } from "../src/client/i18n/messages/system";
import { languageSetting, t, tn } from "../src/client/i18n";

const GROUPS = { shell, fontsText, colorsText, inspectText, systemText, settingsText };

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? "").sort();
}

describe("textes du panneau", () => {
  for (const [name, group] of Object.entries(GROUPS)) {
    it(`${name} : mêmes clés et mêmes variables en français et en anglais`, () => {
      const english: Record<string, string> = group.en;
      expect(Object.keys(english).sort()).toEqual(Object.keys(group.fr).sort());
      for (const [key, fr] of Object.entries(group.fr)) {
        const en = english[key] ?? "";
        expect(en.trim(), key).not.toBe("");
        expect(placeholders(en), key).toEqual(placeholders(fr));
      }
    });
  }

  it("aucune clé n’est déclarée deux fois dans deux groupes", () => {
    const keys = Object.values(GROUPS).flatMap((group) => Object.keys(group.fr));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("traduit, remplace les variables et accorde le pluriel", () => {
    languageSetting.value = "fr";
    expect(tn(3, "footer.one", "footer.other")).toBe("3 modifications");
    expect(t("fonts.deletePairing", { name: "A + B" })).toBe("Supprimer A + B");
    languageSetting.value = "en";
    expect(tn(1, "footer.one", "footer.other")).toBe("1 change");
    expect(t("tab.colors")).toBe("Colors");
    languageSetting.value = "auto";
  });
});
