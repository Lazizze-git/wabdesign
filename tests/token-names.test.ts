import { describe, expect, it } from "vitest";
import { friendlyTokenName, matchesToken, usageLabel } from "../src/client/engine/token-names";

describe("noms lisibles des variables", () => {
  it.each([
    ["--color-encre-2", "Encre 2"],
    ["--color-bleu-survol", "Bleu survol"],
    ["--accent", "Accent"],
    ["--radius", "Arrondi"],
    ["--radius-tuile", "Tuile"],
    ["--font-weight-texte", "Graisse texte"],
    ["--font-sans", "Police sans"],
    ["--text-lg", "Taille lg"],
    ["--text-lg--line-height", "Taille lg · line height"],
    ["--spacing", "Espacement de base"],
    ["--breakpoint-sm", "Écran sm"],
  ])("%s → %s", (name, label) => {
    expect(friendlyTokenName(name)).toBe(label);
  });

  it("compte les usages en toutes lettres", () => {
    expect(usageLabel(0)).toBe("non utilisée");
    expect(usageLabel(1)).toBe("1 usage");
    expect(usageLabel(7)).toBe("7 usages");
  });

  it("trouve une variable par son nom lisible ou technique", () => {
    expect(matchesToken("--radius-tuile", "tuile")).toBe(true);
    expect(matchesToken("--radius", "arrondi")).toBe(true);
    expect(matchesToken("--color-encre", "--color")).toBe(true);
    expect(matchesToken("--color-encre", "papier")).toBe(false);
  });
});
