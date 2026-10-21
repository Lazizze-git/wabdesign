import type { Language } from "../../shared/types";

export type Messages = Record<string, string>;

/**
 * Déclare un groupe de textes dans les deux langues. Le typage oblige la version anglaise
 * à avoir exactement les mêmes clés que la française : aucun texte ne peut manquer.
 */
export function defineMessages<T extends Messages>(fr: T, en: Record<keyof T, string>): Record<Language, T> {
  return { fr, en: en as T };
}
