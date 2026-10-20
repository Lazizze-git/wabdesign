import { copyFile, mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildBrief } from "../src/server/apply/brief";
import { readFont } from "../src/server/fonts/read-font";
import { scanLocalFonts } from "../src/server/fonts/local-library";
import { injectPanel, INJECTION } from "../src/server/inject";
import { configSchema, DEFAULT_CONFIG } from "../src/shared/schemas";
import type { Change } from "../src/shared/types";

const SUPPLEMENTAL = "/System/Library/Fonts/Supplemental";

describe("injection du panneau", () => {
  it("se place juste après <head>", () => {
    expect(injectPanel('<html><head lang="fr"><title>x</title></head></html>')).toBe(
      `<html><head lang="fr">${INJECTION}<title>x</title></head></html>`,
    );
  });

  it("fonctionne sans <head> et ne s'injecte jamais deux fois", () => {
    const once = injectPanel("<p>salut</p>");
    expect(once.startsWith(INJECTION)).toBe(true);
    expect(injectPanel(once)).toBe(once);
  });
});

describe.runIf(process.platform === "darwin")("lecture des polices", () => {
  it("lit famille, graisse et style d'un fichier", async () => {
    const bold = await readFont(join(SUPPLEMENTAL, "Georgia Bold Italic.ttf"));
    expect(bold).toMatchObject({ family: "Georgia", weight: 700, style: "italic", format: "truetype", weightRange: null });
  });

  it("détecte les axes d'une police variable", async () => {
    const variable = await readFont("/System/Library/Fonts/SFNS.ttf");
    expect(variable?.weightRange).not.toBeNull();
    expect(variable?.axes.some((axis) => axis.tag === "wght")).toBe(true);
  });

  it("regroupe les fichiers d'un dossier par famille", async () => {
    const dir = await mkdtemp(join(tmpdir(), "od-fonts-"));
    await mkdir(join(dir, "Georgia"));
    for (const file of ["Georgia.ttf", "Georgia Bold.ttf", "Georgia Italic.ttf"]) {
      await copyFile(join(SUPPLEMENTAL, file), join(dir, "Georgia", file));
    }
    await copyFile(join(SUPPLEMENTAL, "Arial.ttf"), join(dir, "Arial.ttf"));
    const scan = await scanLocalFonts([dir, join(dir, "dossier-absent")]);
    expect(scan.families.map((family) => family.family)).toEqual(["Arial", "Georgia"]);
    const georgia = scan.families.find((family) => family.family === "Georgia");
    expect(georgia?.faces.map((face) => `${face.weight}${face.style}`)).toEqual(["400italic", "400normal", "700normal"]);
    expect(scan.errors).toHaveLength(1);
    expect(scan.files.size).toBe(4);
  });
});

describe("fiche de validation", () => {
  const changes: Change[] = [
    {
      id: "1",
      group: "inspect",
      target: {
        selector: "main > button:nth-of-type(2)",
        label: "Bouton « Réserver »",
        scope: "element",
        context: { tag: "button", classes: ["btn", "btn-primary"], text: "Réserver", count: 1 },
      },
      property: "border-radius",
      value: "999px",
      previous: "4px",
      font: null,
    },
    {
      id: "2",
      group: "swap",
      target: { selector: "*", label: "Toute la page", scope: "global", context: null },
      property: "color",
      value: "#1d3557",
      previous: "#000000",
      font: null,
    },
  ];

  it("décrit chaque modification avec de quoi retrouver l'élément", () => {
    const brief = buildBrief(changes, new Map(), new Date("2026-10-20T12:00:00Z"));
    expect(brief).toContain("## Retouches d'éléments");
    expect(brief).toContain('`<button class="btn btn-primary">`');
    expect(brief).toContain("texte « Réserver »");
    expect(brief).toContain("`border-radius` → `999px` (avant : `4px`)");
    expect(brief).toContain("- `#000000` → `#1d3557`");
    expect(brief).toContain("N'ajoute jamais `!important`");
    expect(brief).not.toContain("Fichiers de police");
  });

  it("décrit un texte réécrit avec l'ancien et le nouveau texte", () => {
    const [element] = changes;
    if (!element) throw new Error("Jeu de test vide");
    const text: Change = {
      ...element,
      id: "3",
      group: "text",
      property: "text",
      value: "Réserver une table",
      previous: "Réserver",
    };
    const brief = buildBrief([text], new Map(), new Date("2026-10-20T12:00:00Z"));
    expect(brief).toContain("## Textes réécrits");
    expect(brief).toContain("« Réserver » → « Réserver une table »");
    expect(brief).toContain("vient de données");
  });
});

describe("réglages", () => {
  it("accepte la configuration par défaut et refuse un format inattendu", () => {
    expect(configSchema.safeParse(DEFAULT_CONFIG).success).toBe(true);
    expect(configSchema.safeParse({ ...DEFAULT_CONFIG, fontFolders: "pas une liste" }).success).toBe(false);
  });
});
