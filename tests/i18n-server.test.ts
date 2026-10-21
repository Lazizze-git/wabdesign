import type { IncomingMessage } from "node:http";
import { describe, expect, it } from "vitest";
import { buildBrief } from "../src/server/apply/brief";
import { describeError, LocalizedError, msg, requestLanguage, resolveTerminalLanguage } from "../src/server/i18n";
import { en, fr } from "../src/server/i18n/messages";
import type { Change } from "../src/shared/types";

function request(headers: Record<string, string>): IncomingMessage {
  return { headers } as unknown as IncomingMessage;
}

describe("langue du serveur", () => {
  it("suit le réglage, sinon les variables de langue du système", () => {
    expect(resolveTerminalLanguage("en", { LANG: "fr_CH.UTF-8" })).toBe("en");
    expect(resolveTerminalLanguage("auto", { LANG: "fr_CH.UTF-8" })).toBe("fr");
    expect(resolveTerminalLanguage("auto", { LC_ALL: "en_US.UTF-8", LANG: "fr_CH.UTF-8" })).toBe("en");
    expect(resolveTerminalLanguage("auto", {})).toBe("en");
  });

  it("répond au panneau dans la langue qu’il demande", () => {
    expect(requestLanguage(request({ "x-wabdesign-lang": "fr" }))).toBe("fr");
    expect(requestLanguage(request({ "x-wabdesign-lang": "en", "accept-language": "fr-CH" }))).toBe("en");
    expect(requestLanguage(request({ "accept-language": "fr-CH,fr;q=0.9" }))).toBe("fr");
  });

  it("remplace les variables et traduit les erreurs au moment de les lire", () => {
    expect(msg("en", "ready", { url: "http://localhost:4000" })).toBe("Preview with design panel: http://localhost:4000");
    const error = new LocalizedError("scanFolderUnreachable", { folder: "/polices", error: "ENOENT" });
    expect(describeError(error, "fr")).toBe("Dossier inaccessible : /polices (ENOENT)");
    expect(describeError(error, "en")).toBe("Folder not accessible: /polices (ENOENT)");
  });

  it("a les mêmes messages dans les deux langues", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
  });
});

describe("fiche en anglais", () => {
  const change: Change = {
    id: "1",
    group: "text",
    target: {
      selector: "main > h1",
      label: "Heading h1",
      scope: "element",
      context: { tag: "h1", classes: [], text: "Hello", count: 1 },
    },
    property: "text",
    value: "Hello there",
    previous: "Hello",
    font: null,
  };

  it("décrit les modifications et demande un résumé en anglais", () => {
    const brief = buildBrief([change], new Map(), new Date("2026-10-20T12:00:00Z"), "en");
    expect(brief).toContain("# Validated design changes");
    expect(brief).toContain("## Rewritten text");
    expect(brief).toContain("scope: element");
    expect(brief).toContain("“Hello” → “Hello there”");
    expect(brief).toContain("End with a summary in English");
    expect(brief).not.toContain("Consignes");
  });
});
