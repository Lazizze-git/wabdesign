import type { IncomingMessage } from "node:http";
import { LANGUAGE_HEADER, type Language, type LanguageSetting } from "../../shared/types";
import { en, fr, type MessageKey } from "./messages";

export type { MessageKey } from "./messages";
export type MessageVars = Readonly<Record<string, string | number>>;

const DICTIONARIES: Record<Language, Record<MessageKey, string>> = { fr, en };

/** Message traduit, avec les {noms} remplacés par leurs valeurs. */
export function msg(language: Language, key: MessageKey, vars: MessageVars = {}): string {
  return DICTIONARIES[language][key].replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/** « auto » : les variables de langue du système (fr_CH.UTF-8 → fr), anglais sinon. */
export function resolveTerminalLanguage(setting: LanguageSetting, env: NodeJS.ProcessEnv = process.env): Language {
  if (setting !== "auto") return setting;
  const locale = env["LC_ALL"] || env["LC_MESSAGES"] || env["LANG"] || "";
  return locale.toLowerCase().startsWith("fr") ? "fr" : "en";
}

let terminalLanguage: Language = resolveTerminalLanguage("auto");

export function setTerminalLanguage(language: Language): void {
  terminalLanguage = language;
}

export function getTerminalLanguage(): Language {
  return terminalLanguage;
}

/** Message dans la langue du terminal. */
export function tm(key: MessageKey, vars: MessageVars = {}): string {
  return msg(terminalLanguage, key, vars);
}

function parseLanguage(value: string | undefined): Language | null {
  const lower = value?.trim().toLowerCase() ?? "";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("en")) return "en";
  return null;
}

/** Langue des réponses au panneau : en-tête du panneau, sinon langue du navigateur, sinon du terminal. */
export function requestLanguage(req: IncomingMessage): Language {
  const header = req.headers[LANGUAGE_HEADER];
  const fromPanel = parseLanguage(Array.isArray(header) ? header[0] : header);
  if (fromPanel) return fromPanel;
  return parseLanguage(req.headers["accept-language"]?.split(",")[0]) ?? terminalLanguage;
}

/** Erreur dont le message est traduit au moment de l’afficher, dans la langue de celui qui la lit. */
export class LocalizedError extends Error {
  constructor(
    readonly key: MessageKey,
    readonly vars: MessageVars = {},
  ) {
    super(msg("en", key, vars));
  }
}

export function describeError(error: unknown, language: Language): string {
  if (error instanceof LocalizedError) return msg(language, error.key, error.vars);
  return error instanceof Error ? error.message : String(error);
}
