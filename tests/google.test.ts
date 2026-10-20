import { describe, expect, it } from "vitest";
import { googleFamilyUrl, googlePreviewUrl, sortAxisTags } from "../src/shared/google";
import { parseGoogleFaceKey, toFontFamily } from "../src/server/fonts/google-library";

describe("Google Fonts", () => {
  it("lit les clés de graisse du catalogue", () => {
    expect(parseGoogleFaceKey("400")).toEqual({ weight: 400, style: "normal" });
    expect(parseGoogleFaceKey("700i")).toEqual({ weight: 700, style: "italic" });
    expect(parseGoogleFaceKey("variable")).toBeNull();
  });

  it("trie les axes : minuscules d'abord, puis majuscules", () => {
    expect(sortAxisTags(["wght", "GRAD", "opsz", "XTRA", "wdth"])).toEqual(["opsz", "wdth", "wght", "GRAD", "XTRA"]);
  });

  it("construit l'URL d'une famille statique avec italiques", () => {
    const family = toFontFamily({ family: "Spectral", category: "Serif", fonts: { "400": {}, "700": {}, "400i": {} } });
    expect(googleFamilyUrl(family)).toBe(
      "https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,700;1,400&display=swap",
    );
  });

  it("construit l'URL d'une famille statique sans italique", () => {
    const family = toFontFamily({ family: "Anton", fonts: { "400": {} } });
    expect(googleFamilyUrl(family)).toBe("https://fonts.googleapis.com/css2?family=Anton:wght@400&display=swap");
  });

  it("construit l'URL d'une famille variable avec tous ses axes", () => {
    const family = toFontFamily({
      family: "Recursive",
      fonts: { "400": {}, "400i": {} },
      axes: [
        { tag: "wght", min: 100, max: 1000, defaultValue: 400 },
        { tag: "GRAD", min: -200, max: 150, defaultValue: 0 },
        { tag: "opsz", min: 8, max: 144, defaultValue: 14 },
      ],
    });
    expect(family.faces[0]?.weightRange).toEqual([100, 1000]);
    expect(googleFamilyUrl(family)).toBe(
      "https://fonts.googleapis.com/css2?family=Recursive:ital,opsz,wght,GRAD@0,8..144,100..1000,-200..150;1,8..144,100..1000,-200..150&display=swap",
    );
  });

  it("charge un aperçu limité aux lettres du nom", () => {
    expect(googlePreviewUrl("Host Grotesk")).toBe("https://fonts.googleapis.com/css2?family=Host+Grotesk&text=Host%20Grotesk&display=block");
  });
});
