import { describe, expect, it } from "vitest";
import { parseListeningPorts, parseWorkingDirs } from "../src/server/project-server";

describe("repérage de la preview du projet", () => {
  it("associe chaque processus à ses ports d'écoute", () => {
    const output = "p100\nf20\nn*:3100\nf21\nn[::1]:3100\np200\nf9\nn127.0.0.1:4000\n";
    expect(parseListeningPorts(output)).toEqual(new Map([[100, [3100]], [200, [4000]]]));
  });

  it("associe chaque processus à son dossier de travail", () => {
    const output = "p100\nfcwd\nn/Users/moi/Projet A\np200\nfcwd\nn/Users/moi/Projet B\n";
    expect(parseWorkingDirs(output)).toEqual(new Map([[100, "/Users/moi/Projet A"], [200, "/Users/moi/Projet B"]]));
  });
});
