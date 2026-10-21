import { computed, signal } from "@preact/signals";
import type { Language, LanguageSetting } from "../../shared/types";
import { colorsText } from "./messages/colors";
import { fontsText } from "./messages/fonts";
import { inspectText } from "./messages/inspect";
import { settingsText } from "./messages/settings";
import { shell } from "./messages/shell";
import { systemText } from "./messages/system";

type Dictionary = typeof shell.fr &
  typeof fontsText.fr &
  typeof colorsText.fr &
  typeof inspectText.fr &
  typeof systemText.fr &
  typeof settingsText.fr;

export type MessageKey = keyof Dictionary;
type Vars = Record<string, string | number>;

const GROUPS = [shell, fontsText, colorsText, inspectText, systemText, settingsText];

function merge(language: Language): Dictionary {
  return GROUPS.reduce<Record<string, string>>((all, group) => ({ ...all, ...group[language] }), {}) as Dictionary;
}

const DICTIONARIES: Record<Language, Dictionary> = { fr: merge("fr"), en: merge("en") };

/** Réglage choisi (« auto » suit la langue du navigateur). */
export const languageSetting = signal<LanguageSetting>("auto");

export function browserLanguage(): Language {
  const preferred = typeof navigator === "undefined" ? "en" : navigator.language;
  return preferred.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export const language = computed<Language>(() =>
  languageSetting.value === "auto" ? browserLanguage() : languageSetting.value,
);

/** Texte traduit ; `{nom}` est remplacé par la variable du même nom. Lire `language` abonne le composant. */
export function t(key: MessageKey, vars?: Vars): string {
  const text = DICTIONARIES[language.value][key];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match: string, name: string) => (name in vars ? String(vars[name]) : match));
}

/** Singulier ou pluriel selon `n` (disponible dans le texte sous `{n}`). */
export function tn(n: number, one: MessageKey, other: MessageKey, vars?: Vars): string {
  return t(n === 1 ? one : other, { n, ...vars });
}
