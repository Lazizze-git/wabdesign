import { describe, expect, it } from "vitest";
import { classifyToken, stepFor, unitsFor } from "../src/client/engine/token-kinds";

const isColor = (value: string): boolean => /^(#|oklch\(|rgb)/.test(value);

describe("classement des variables", () => {
  it.each([
    ["--primary", "#b23a48", "color"],
    ["--color-red-500", "oklch(63.7% 0.237 25.331)", "color"],
    ["--font-sans", '"Host Grotesk", sans-serif', "font"],
    ["--font-weight-bold", "700", "weight"],
    ["--text-lg", "1.125rem", "size"],
    ["--text-lg--line-height", "calc(1.75 / 1.125)", "leading"],
    ["--leading-tight", "1.25", "leading"],
    ["--tracking-wide", "0.025em", "tracking"],
    ["--radius", "0.625rem", "radius"],
    ["--radius-lg", "calc(var(--radius) + 4px)", "radius"],
    ["--spacing", "0.25rem", "spacing"],
    ["--shadow-md", "0 4px 6px -1px rgb(0 0 0 / 0.1)", "shadow"],
    ["--container-lg", "32rem", "layout"],
    ["--ease-out", "cubic-bezier(0, 0, 0.2, 1)", "other"],
  ])("%s → %s", (name, value, kind) => {
    expect(classifyToken(name, value, isColor)).toBe(kind);
  });

  it("propose d'abord l'unité déjà utilisée", () => {
    expect(unitsFor("0.625rem")).toEqual(["rem", "px"]);
    expect(unitsFor("4px")).toEqual(["px", "rem"]);
    expect(unitsFor("1.5")).toEqual([""]);
  });

  it("adapte le pas au type de valeur", () => {
    expect(stepFor("700", "weight")).toBe(100);
    expect(stepFor("1.25", "leading")).toBe(0.05);
    expect(stepFor("0.625rem", "radius")).toBe(0.0625);
    expect(stepFor("4px", "radius")).toBe(1);
  });
});
