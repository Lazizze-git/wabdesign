import type { Change, ChangeGroup } from "../../shared/types";
import type { FaceRecord } from "../fonts/read-font";

const GROUP_TITLES: Record<ChangeGroup, string> = {
  fonts: "Polices",
  system: "Réglages globaux",
  vars: "Variables du design system (modifie la variable à sa source)",
  swap: "Échanges de couleur (partout dans le site)",
  inspect: "Retouches d'éléments",
  text: "Textes réécrits",
};

const GROUP_ORDER: readonly ChangeGroup[] = ["fonts", "system", "vars", "swap", "inspect", "text"];

const RULES = `## Consignes
- Ces modifications ont été testées en direct dans la preview. Elles sont exprimées en CSS : sélecteur, propriété, valeur.
- Respecte la façon dont le projet gère déjà ses styles (variables CSS, thème Tailwind, fichiers CSS, CSS modules, composants). Quand une modification touche une valeur qui vient d'un jeton ou d'une variable, modifie la source plutôt que d'ajouter une surcharge.
- Portée : « global », « rôle » et « balise » visent une règle générale (thème, styles de base). « similaires » vise le composant ou la classe concernée. « élément » vise uniquement cet élément : retrouve-le grâce à son texte et à ses classes.
- N'ajoute jamais \`!important\` : il ne sert qu'à la preview.
- Polices locales : copie les fichiers listés en bas dans le dossier de polices du projet (par exemple \`public/fonts\`) et déclare-les (\`@font-face\` avec font-display: swap, ou \`next/font/local\` dans un projet Next.js). N'utilise que les graisses réellement employées.
- Google Fonts : charge-les comme le projet le fait déjà (\`next/font/google\`, balise \`<link>\`, \`@import\`). À défaut, ajoute une balise \`<link>\` avec uniquement les graisses employées.
- Textes réécrits : remplace l'ancien texte par le nouveau là où il est écrit dans le code (composant, page, fichier de contenu, traductions). Si ce texte vient de données (base de données, CMS, API), ne le modifie pas et signale-le dans ton résumé.
- Échanges de couleur : remplace l'ancienne couleur par la nouvelle partout où elle est définie, de préférence à sa source (variable, thème).
- Ne modifie rien d'autre, ne lance aucun serveur, n'installe aucun paquet sans nécessité.
- Termine par un résumé en français de trois lignes au maximum.`;

function scopeLabel(change: Change): string {
  const labels: Record<Change["target"]["scope"], string> = {
    element: "élément",
    similar: "similaires",
    tag: "balise",
    role: "rôle",
    global: "global",
  };
  return labels[change.target.scope];
}

function describeTarget(change: Change): string {
  const { target } = change;
  const parts = [`**${target.label}**`, `portée : ${scopeLabel(change)}`, `sélecteur \`${target.selector}\``];
  const context = target.context;
  if (context) {
    const classes = context.classes.length > 0 ? ` class="${context.classes.join(" ")}"` : "";
    parts.push(`\`<${context.tag}${classes}>\``);
    if (context.text) parts.push(`texte « ${context.text} »`);
    parts.push(`${context.count} élément(s) dans la page`);
  }
  return parts.join(" · ");
}

function quote(text: string | null): string {
  return `« ${(text ?? "").replace(/\s+/g, " ").trim()} »`;
}

function describeChange(change: Change): string {
  if (change.group === "text") return `- ${describeTarget(change)} : ${quote(change.previous)} → ${quote(change.value)}`;
  if (change.group === "swap") return `- \`${change.previous ?? "?"}\` → \`${change.value}\``;
  const before = change.previous ? ` (avant : \`${change.previous}\`)` : "";
  return `- ${describeTarget(change)} : \`${change.property}\` → \`${change.value}\`${before}`;
}

function fontFilesSection(localFonts: ReadonlyMap<string, FaceRecord[]>): string {
  if (localFonts.size === 0) return "";
  const lines = ["## Fichiers de police à copier"];
  for (const [family, faces] of localFonts) {
    lines.push(`### ${family}`);
    for (const face of faces) {
      const weight = face.weightRange ? `variable ${face.weightRange[0]}–${face.weightRange[1]}` : `${face.weight}`;
      lines.push(`- ${weight} ${face.style} (${face.format}) : \`${face.path}\``);
    }
  }
  return lines.join("\n");
}

/** Rédige la fiche (Markdown) que Claude Code lira pour appliquer les modifications. */
export function buildBrief(
  changes: readonly Change[],
  localFonts: ReadonlyMap<string, FaceRecord[]>,
  date: Date,
): string {
  const sections = [`# Modifications de design validées — ${date.toLocaleString("fr-CH")}`, RULES];
  for (const group of GROUP_ORDER) {
    const items = changes.filter((change) => change.group === group);
    if (items.length === 0) continue;
    sections.push(`## ${GROUP_TITLES[group]}\n${items.map(describeChange).join("\n")}`);
  }
  const files = fontFilesSection(localFonts);
  if (files) sections.push(files);
  return `${sections.join("\n\n")}\n`;
}
