import { describe, expect, it } from "vitest";
import { formatLength, parseLength, weightName } from "../src/client/engine/css-value";
import { formatVariationSettings, parseVariationSettings } from "../src/client/ui/fonts/AxesControl";

describe("valeurs numériques", () => {
  it("lit nombre et unité", () => {
    expect(parseLength("16px")).toEqual({ value: 16, unit: "px" });
    expect(parseLength("-0.02em")).toEqual({ value: -0.02, unit: "em" });
    expect(parseLength("1.5")).toEqual({ value: 1.5, unit: "" });
    expect(parseLength(".5rem")).toEqual({ value: 0.5, unit: "rem" });
    expect(parseLength("normal")).toBeNull();
  });

  it("arrondit proprement à l'écriture", () => {
    expect(formatLength({ value: 12.3456, unit: "px" })).toBe("12.35px");
    expect(formatLength({ value: 0.01999, unit: "em" })).toBe("0.02em");
    expect(formatLength({ value: 1.25, unit: "" })).toBe("1.25");
  });

  it("nomme les graisses", () => {
    expect(weightName(700)).toBe("Bold 700");
    expect(weightName(450)).toBe("450");
  });
});

describe("axes variables", () => {
  it("lit et réécrit font-variation-settings", () => {
    const parsed = parseVariationSettings('"wdth" 87.5, "opsz" 32');
    expect(parsed).toEqual({ wdth: 87.5, opsz: 32 });
    expect(formatVariationSettings(parsed)).toBe('"wdth" 87.5, "opsz" 32');
    expect(formatVariationSettings({})).toBe("normal");
  });
});
