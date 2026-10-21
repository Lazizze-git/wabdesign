import type { Change, ChangeGroup, Language } from "../../shared/types";

/** Textes de la fiche lue par Claude Code, en français et en anglais. */
export interface BriefText {
  title: string;
  locale: string;
  rules: string;
  groups: Record<ChangeGroup, string>;
  scopes: Record<Change["target"]["scope"], string>;
  scope: string;
  selector: string;
  text: string;
  inPage: string;
  before: string;
  /** Deux-points précédé de l’espace qui convient à la langue. */
  colon: string;
  fontFiles: string;
  open: string;
  close: string;
}

const FR_RULES = `## Consignes
- Ces modifications ont été testées en direct dans la preview. Elles sont exprimées en CSS : sélecteur, propriété, valeur.
- Respecte la façon dont le projet gère déjà ses styles (variables CSS, thème Tailwind, fichiers CSS, CSS modules, composants). Quand une modification touche une valeur qui vient d'un jeton ou d'une variable, modifie la source plutôt que d'ajouter une surcharge.
- Portée : « global », « rôle » et « balise » visent une règle générale (thème, styles de base). « similaires » vise le composant ou la classe concernée. « élément » vise uniquement cet élément : retrouve-le grâce à son texte et à ses classes.
- N'ajoute jamais \`!important\` : il ne sert qu'à la preview.
- Polices locales : copie les fichiers listés en bas dans le dossier de polices du projet (par exemple \`public/fonts\`) et déclare-les (\`@font-face\` avec font-display: swap, ou \`next/font/local\` dans un projet Next.js). N'utilise que les graisses réellement employées.
- Google Fonts : charge-les comme le projet le fait déjà (\`next/font/google\`, balise \`<link>\`, \`@import\`). À défaut, ajoute une balise \`<link>\` avec uniquement les graisses employées.
- Textes réécrits : remplace l'ancien texte par le nouveau là où il est écrit dans le code (composant, page, fichier de contenu, traductions). Si ce texte vient de données (base de données, CMS, API), ne le modifie pas et signale-le dans ton résumé.
- Échanges de couleur : remplace l'ancienne couleur par la nouvelle partout où elle est définie, de préférence à sa source (variable, thème).
- Ne modifie rien d'autre, ne lance aucun serveur, n'installe aucun paquet sans nécessité.
- Termine par un résumé en français de trois lignes au maximum.`;

const EN_RULES = `## Instructions
- These changes were tested live in the preview. They are written as CSS: selector, property, value.
- Follow the way the project already handles its styles (CSS variables, Tailwind theme, CSS files, CSS modules, components). When a change touches a value that comes from a token or a variable, change the source instead of adding an override.
- Scope: "global", "role" and "tag" mean a general rule (theme, base styles). "similar" means the component or class concerned. "element" means only that element: find it from its text and classes.
- Never add \`!important\`: it is only used in the preview.
- Local fonts: copy the files listed at the bottom into the project's font folder (for example \`public/fonts\`) and declare them (\`@font-face\` with font-display: swap, or \`next/font/local\` in a Next.js project). Only include the weights actually used.
- Google Fonts: load them the way the project already does (\`next/font/google\`, a \`<link>\` tag, \`@import\`). Otherwise, add a \`<link>\` tag with only the weights used.
- Rewritten text: replace the old text with the new one where it is written in the code (component, page, content file, translations). If the text comes from data (database, CMS, API), leave it unchanged and mention it in your summary.
- Color swaps: replace the old color with the new one everywhere it is defined, preferably at its source (variable, theme).
- Change nothing else, do not start any server, do not install packages unless necessary.
- End with a summary in English of three lines at most.`;

export const BRIEF_TEXT: Record<Language, BriefText> = {
  fr: {
    title: "Modifications de design validées",
    locale: "fr-CH",
    rules: FR_RULES,
    groups: {
      fonts: "Polices",
      system: "Réglages globaux",
      vars: "Variables du design system (modifie la variable à sa source)",
      swap: "Échanges de couleur (partout dans le site)",
      inspect: "Retouches d'éléments",
      text: "Textes réécrits",
    },
    scopes: { element: "élément", similar: "similaires", tag: "balise", role: "rôle", global: "global" },
    scope: "portée : ",
    selector: "sélecteur ",
    text: "texte ",
    inPage: "élément(s) dans la page",
    before: "avant : ",
    colon: "\u202f:",
    fontFiles: "Fichiers de police à copier",
    open: "« ",
    close: " »",
  },
  en: {
    title: "Validated design changes",
    locale: "en-GB",
    rules: EN_RULES,
    groups: {
      fonts: "Fonts",
      system: "Global settings",
      vars: "Design system variables (change the variable at its source)",
      swap: "Color swaps (everywhere on the site)",
      inspect: "Element tweaks",
      text: "Rewritten text",
    },
    scopes: { element: "element", similar: "similar", tag: "tag", role: "role", global: "global" },
    scope: "scope: ",
    selector: "selector ",
    text: "text ",
    inPage: "element(s) on the page",
    before: "before: ",
    colon: ":",
    fontFiles: "Font files to copy",
    open: "“",
    close: "”",
  },
};
